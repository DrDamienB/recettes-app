"use server";

import { prisma } from "@/lib/prisma";

type IngredientGroup = {
  name: string;
  quantity: number;
  unit: string;
  storeSection: string;
  storeName: string;
  checked: boolean;
  mealPlans: Array<{ date: string; slot: string; recipeTitle: string }>;
};

export async function getDynamicShoppingList(startDate: Date, endDate: Date) {
  // Récupérer tous les meal plans pour la période
  const mealPlans = await prisma.mealPlan.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: {
        include: {
          Recipe: {
            include: {
              ingredients: {
                include: {
                  Ingredient: true,
                  Unit: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Grouper les ingrédients par nom normalisé
  const ingredientsMap = new Map<string, IngredientGroup>();

  for (const mealPlan of mealPlans) {
    const dateStr = mealPlan.date.toISOString().split("T")[0];

    for (const item of mealPlan.items) {
      if (!item.Recipe) continue;

      const servings = item.Recipe.servingsDefault;
      const recipeTitle = item.Recipe.title;

      for (const recipeIngredient of item.Recipe.ingredients) {
        const ingredientName = recipeIngredient.Ingredient.nameNormalized;
        const quantity = recipeIngredient.qtyPerPerson * servings;
        const unit = recipeIngredient.Unit?.singularForm || recipeIngredient.unitCode;
        const storeSection = recipeIngredient.Ingredient.storeSection || "autre";
        const storeName = recipeIngredient.Ingredient.storeName || "Supermarché";

        const key = `${ingredientName}-${unit}-${storeSection}-${storeName}`;

        if (ingredientsMap.has(key)) {
          const existing = ingredientsMap.get(key)!;
          existing.quantity += quantity;
          existing.mealPlans.push({
            date: dateStr,
            slot: mealPlan.slot,
            recipeTitle,
          });
        } else {
          ingredientsMap.set(key, {
            name: ingredientName,
            quantity,
            unit,
            storeSection,
            storeName,
            checked: false,
            mealPlans: [
              {
                date: dateStr,
                slot: mealPlan.slot,
                recipeTitle,
              },
            ],
          });
        }
      }
    }
  }

  // Grouper par magasin puis par rayon
  const groupedByStore: Record<
    string,
    Record<string, IngredientGroup[]>
  > = {};

  for (const ingredient of ingredientsMap.values()) {
    if (!groupedByStore[ingredient.storeName]) {
      groupedByStore[ingredient.storeName] = {};
    }
    if (!groupedByStore[ingredient.storeName][ingredient.storeSection]) {
      groupedByStore[ingredient.storeName][ingredient.storeSection] = [];
    }
    groupedByStore[ingredient.storeName][ingredient.storeSection].push(
      ingredient
    );
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    groupedByStore,
    totalItems: ingredientsMap.size,
  };
}
