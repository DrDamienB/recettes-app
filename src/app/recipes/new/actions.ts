"use server";

import { prisma } from "@/lib/prisma";
import { normalizeName } from "@/lib/normalize";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type IngredientInput = {
  name: string;          // affiché par l'utilisateur (ex: "Œuf")
  qtyPerPerson: number;  // ex: 0.5
  unitCode: "g" | "kg" | "mL" | "L" | "piece" | "cac" | "cas";
  storeSection?: string; // optionnel, ex: "crèmerie"
};

export async function createRecipe(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const prepMin = Number(formData.get("prepMin") || 0) || null;
  const cookMin = Number(formData.get("cookMin") || 0) || null;
  const servingsDefault = Number(formData.get("servingsDefault") || 2) || 2;
  const tagsRaw = String(formData.get("tags") || "").trim();
  const stepsRaw = String(formData.get("steps") || "").trim();

  if (!title) throw new Error("Titre requis");

  // Récupérer les lignes d’ingrédients (JSON encodé par le composant client)
  const ingJSON = String(formData.get("ingredients") || "[]");
  const ingredients = JSON.parse(ingJSON) as IngredientInput[];

  // 1) Créer/associer les ingrédients (dédup par nameNormalized)
  const createdIngredients = [];
  for (const ing of ingredients) {
    const nameNormalized = normalizeName(ing.name);
    if (!nameNormalized) continue;

    // détermine l’unité canonique (mass→g, volume→mL, count→piece)
    const unitMap: Record<string, { canonical: string }> = {
      g: { canonical: "g" }, kg: { canonical: "g" },
      mL: { canonical: "mL" }, L: { canonical: "mL" },
      cac: { canonical: "mL" }, cas: { canonical: "mL" },
      piece: { canonical: "piece" },
    };
    const canonicalUnit = unitMap[ing.unitCode]?.canonical || "piece";
    const section = ing.storeSection || "épicerie salée";

    const ingredient = await prisma.ingredient.upsert({
      where: { nameNormalized },
      update: {
        storeSection: section, // met à jour si besoin
        canonicalUnit,
      },
      create: {
        nameNormalized,
        canonicalUnit,
        storeSection: section,
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
  const slug = normalizeName(title).replace(/\s+/g, "-");
  const tags = tagsRaw ? tagsRaw.split(",").map(t => normalizeName(t)) : [];

  const steps = stepsRaw
    ? stepsRaw.split("\n").map(s => s.trim()).filter(Boolean)
    : [];

  const recipe = await prisma.recipe.create({
    data: {
      title,
      slug,
      description: description || null,
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
  redirect("/recipes");
}
