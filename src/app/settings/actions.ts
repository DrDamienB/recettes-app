"use server";

import { prisma } from "@/lib/prisma";
import { changePassword, getCurrentSession, revokeDevice } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Mettre à jour les formes d'une unité
export async function updateUnitForms(
  code: string,
  singularForm: string,
  pluralForm: string
) {
  await prisma.unit.update({
    where: { code },
    data: {
      singularForm,
      pluralForm,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

// Changer le mot de passe
export async function changePasswordAction(
  prevState: any,
  formData: FormData
) {
  const session = await getCurrentSession();

  if (!session) {
    return { success: false, error: "Non authentifié" };
  }

  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "Tous les champs sont requis" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Les mots de passe ne correspondent pas" };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "Le mot de passe doit faire au moins 6 caractères" };
  }

  const result = await changePassword(session.userId, oldPassword, newPassword);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, message: "Mot de passe modifié avec succès" };
}

// Révoquer un appareil
export async function revokeDeviceAction(deviceId: number) {
  await revokeDevice(deviceId);
  revalidatePath("/settings");
  return { success: true };
}

// Export CSV
export async function exportRecipesCSV() {
  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: {
        include: {
          Ingredient: true,
          Unit: true,
        },
      },
      steps: {
        orderBy: { order: "asc" },
      },
    },
  });

  // Format CSV: titre, description, prepMin, cookMin, servings, tags (JSON), ingredients (JSON), steps (JSON)
  const csvLines = [
    // Header
    "titre,description,prepMin,cookMin,servingsDefault,tags,ingredients,steps",
  ];

  for (const recipe of recipes) {
    const tags = JSON.stringify(recipe.tags);
    const ingredients = JSON.stringify(
      recipe.ingredients.map((ing) => ({
        name: ing.Ingredient.nameNormalized,
        qtyPerPerson: ing.qtyPerPerson,
        unit: ing.unitCode,
        storeSection: ing.Ingredient.storeSection,
        storeName: ing.Ingredient.storeName,
      }))
    );
    const steps = JSON.stringify(recipe.steps.map((s) => s.text));

    const line = [
      escapeCsvField(recipe.title),
      escapeCsvField(recipe.description || ""),
      recipe.prepMin || "",
      recipe.cookMin || "",
      recipe.servingsDefault,
      escapeCsvField(tags),
      escapeCsvField(ingredients),
      escapeCsvField(steps),
    ].join(",");

    csvLines.push(line);
  }

  return csvLines.join("\n");
}

// Helper pour échapper les champs CSV
function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// Import CSV
export async function importRecipesCSV(csvContent: string) {
  const lines = csvContent.split("\n");
  const header = lines[0];

  // Vérifier le format
  if (!header.includes("titre") || !header.includes("ingredients")) {
    return { success: false, error: "Format CSV invalide. Vérifiez l'en-tête." };
  }

  let imported = 0;
  let errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      // Parsing CSV basique (simplifié, pourrait être amélioré)
      const fields = parseCsvLine(line);

      if (fields.length < 8) {
        errors.push(`Ligne ${i + 1}: nombre de champs insuffisant`);
        continue;
      }

      const [title, description, prepMin, cookMin, servingsDefault, tagsJson, ingredientsJson, stepsJson] = fields;

      // Créer le slug
      const slug = title.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Parser les JSONs
      const tags = JSON.parse(tagsJson || "[]");
      const ingredientsData = JSON.parse(ingredientsJson || "[]");
      const stepsData = JSON.parse(stepsJson || "[]");

      // Créer la recette
      const recipe = await prisma.recipe.create({
        data: {
          title,
          slug: `${slug}-${Date.now()}`, // ajouter timestamp pour unicité
          description: description || null,
          prepMin: prepMin ? parseInt(prepMin) : null,
          cookMin: cookMin ? parseInt(cookMin) : null,
          servingsDefault: parseInt(servingsDefault) || 2,
          tags,
        },
      });

      // Créer les steps
      for (let j = 0; j < stepsData.length; j++) {
        await prisma.recipeStep.create({
          data: {
            recipeId: recipe.id,
            order: j + 1,
            text: stepsData[j],
          },
        });
      }

      // Créer les ingrédients
      for (const ingData of ingredientsData) {
        // Créer ou récupérer l'ingrédient
        const ingredient = await prisma.ingredient.upsert({
          where: { nameNormalized: ingData.name },
          update: {},
          create: {
            nameNormalized: ingData.name,
            canonicalUnit: ingData.unit || "g",
            storeSection: ingData.storeSection || "épicerie salée",
            storeName: ingData.storeName || "Auchan",
            synonyms: [],
          },
        });

        await prisma.recipeIngredient.create({
          data: {
            recipeId: recipe.id,
            ingredientId: ingredient.id,
            qtyPerPerson: ingData.qtyPerPerson,
            unitCode: ingData.unit,
          },
        });
      }

      imported++;
    } catch (error) {
      errors.push(`Ligne ${i + 1}: ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  }

  revalidatePath("/recipes");

  return {
    success: true,
    imported,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// Helper pour parser une ligne CSV
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}
