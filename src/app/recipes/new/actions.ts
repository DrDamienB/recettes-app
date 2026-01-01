"use server";

import { prisma } from "@/lib/prisma";
import { normalizeName } from "@/lib/normalize";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Schéma de validation Zod pour un ingrédient
const ingredientSchema = z.object({
  name: z.string().min(1, "Le nom de l'ingrédient est obligatoire"),
  qtyPerPerson: z.number().positive("La quantité doit être supérieure à 0"),
  unitCode: z.enum(["g", "kg", "mL", "L", "piece", "cac", "cas"]),
  storeSection: z.string().optional(),
  storeName: z.string().optional(),
});

// Schéma de validation Zod pour la recette
const recipeSchema = z.object({
  title: z.string()
    .min(1, "Le titre est obligatoire")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
  description: z.string().optional(),
  prepMin: z.number().min(0).nullable().optional(),
  cookMin: z.number().min(0).nullable().optional(),
  servingsDefault: z.number()
    .min(1, "Le nombre de portions doit être au minimum 1")
    .max(50, "Le nombre de portions ne peut pas dépasser 50"),
  tags: z.string().optional(),
  steps: z.string().optional(),
  ingredients: z.array(ingredientSchema)
    .min(0, "Au moins un ingrédient est recommandé"),
});

type IngredientInput = z.infer<typeof ingredientSchema>;

// Type pour l'état retourné par l'action
export type RecipeFormState = {
  success: boolean;
  error?: string;
};

export async function createRecipe(
  prevState: RecipeFormState | null,
  formData: FormData
): Promise<RecipeFormState> {
  // Extraction des données brutes
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const prepMinRaw = formData.get("prepMin");
  const cookMinRaw = formData.get("cookMin");
  const servingsDefaultRaw = formData.get("servingsDefault");
  const tagsRaw = String(formData.get("tags") || "").trim();
  const stepsRaw = String(formData.get("steps") || "").trim();
  const storeNameRaw = String(formData.get("storeName") || "").trim();
  const ingJSON = String(formData.get("ingredients") || "[]");

  // Parse des ingrédients
  let ingredientsParsed: IngredientInput[] = [];
  try {
    ingredientsParsed = JSON.parse(ingJSON);
  } catch {
    return { success: false, error: "Format d'ingrédients invalide" };
  }

  // Validation avec Zod
  const validationResult = recipeSchema.safeParse({
    title,
    description: description || undefined,
    prepMin: prepMinRaw ? Number(prepMinRaw) : null,
    cookMin: cookMinRaw ? Number(cookMinRaw) : null,
    servingsDefault: servingsDefaultRaw ? Number(servingsDefaultRaw) : 2,
    tags: tagsRaw || undefined,
    steps: stepsRaw || undefined,
    ingredients: ingredientsParsed,
  });

  if (!validationResult.success) {
    // Formatage des erreurs pour affichage
    const errors = validationResult.error.issues
      .map(err => {
        const path = err.path && err.path.length > 0 ? err.path.join(".") : "general";
        return `${path}: ${err.message}`;
      })
      .join(", ");
    return { success: false, error: `Erreur de validation: ${errors}` };
  }

  const validated = validationResult.data;
  const ingredients = validated.ingredients;
  const prepMin = validated.prepMin ?? null;
  const cookMin = validated.cookMin ?? null;
  const servingsDefault = validated.servingsDefault;

  try {
    // 1) Créer/associer les ingrédients (dédup par nameNormalized)
    const createdIngredients = [];
    for (const ing of ingredients) {
      const nameNormalized = normalizeName(ing.name);
      if (!nameNormalized) continue;

      // détermine l'unité canonique (mass→g, volume→mL, count→piece)
      const unitMap: Record<string, { canonical: string }> = {
        g: { canonical: "g" }, kg: { canonical: "g" },
        mL: { canonical: "mL" }, L: { canonical: "mL" },
        cac: { canonical: "mL" }, cas: { canonical: "mL" },
        piece: { canonical: "piece" },
      };
      const canonicalUnit = unitMap[ing.unitCode]?.canonical || "piece";
      const section = ing.storeSection || "épicerie salée";
      const store = ing.storeName || storeNameRaw || null;

      const ingredient = await prisma.ingredient.upsert({
        where: { nameNormalized },
        update: {
          storeSection: section, // met à jour si besoin
          storeName: store,
          canonicalUnit,
        },
        create: {
          nameNormalized,
          canonicalUnit,
          storeSection: section,
          storeName: store,
          synonyms: [] as any,
        },
      });

      createdIngredients.push({
        ingredientId: ingredient.id,
        qtyPerPerson: Number(ing.qtyPerPerson) || 0,
        unitCode: ing.unitCode,
      });
    }

    // 2) Création de la recette + étapes
    const slug = normalizeName(validated.title).replace(/\s+/g, "-");
    const tags = validated.tags ? validated.tags.split(",").map(t => normalizeName(t)) : [];

    const steps = validated.steps
      ? validated.steps.split("\n").map(s => s.trim()).filter(Boolean)
      : [];

    await prisma.recipe.create({
      data: {
        title: validated.title,
        slug,
        description: validated.description || null,
        prepMin,
        cookMin,
        servingsDefault,
        tags: tags as any,
        steps: {
          create: steps.map((text, i) => ({ order: i + 1, text })),
        },
        ingredients: {
          create: createdIngredients,
        },
      },
    });

    // Revalider la liste /recipes
    revalidatePath("/recipes");
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de la recette"
    };
  }

  // Redirection après succès
  redirect("/recipes");
}
