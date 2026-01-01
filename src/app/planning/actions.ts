"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Récupère tous les meal plans pour une période donnée
 */
export async function getMealPlans(startDate: Date, endDate: Date) {
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
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Sérialiser les dates pour éviter les erreurs de sérialisation JSON
  return mealPlans.map(mp => ({
    ...mp,
    date: mp.date.toISOString(),
  }));
}

/**
 * Récupère toutes les recettes pour le dropdown
 */
export async function getRecipesForDropdown() {
  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  return recipes;
}

/**
 * Assigne une recette à un créneau (date + slot)
 */
export async function assignRecipeToSlot(
  date: Date,
  slot: "midi" | "soir",
  recipeId: number,
  peopleCount: number
) {
  try {
    // Chercher si un meal plan existe déjà pour cette date/slot
    let mealPlan = await prisma.mealPlan.findFirst({
      where: {
        date: date,
        slot: slot,
      },
      include: {
        items: true,
      },
    });

    if (mealPlan) {
      // Mettre à jour le nombre de personnes
      await prisma.mealPlan.update({
        where: { id: mealPlan.id },
        data: { peopleCount },
      });

      // Supprimer les anciens items
      await prisma.mealPlanItem.deleteMany({
        where: { mealPlanId: mealPlan.id },
      });

      // Ajouter le nouvel item
      await prisma.mealPlanItem.create({
        data: {
          mealPlanId: mealPlan.id,
          recipeId: recipeId,
        },
      });
    } else {
      // Créer un nouveau meal plan avec son item
      await prisma.mealPlan.create({
        data: {
          date: date,
          slot: slot,
          peopleCount: peopleCount,
          items: {
            create: {
              recipeId: recipeId,
            },
          },
        },
      });
    }

    revalidatePath("/planning");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'assignation",
    };
  }
}

/**
 * Supprime une recette d'un créneau
 */
export async function removeRecipeFromSlot(date: Date, slot: "midi" | "soir") {
  try {
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        date: date,
        slot: slot,
      },
    });

    if (mealPlan) {
      // Supprimer les items puis le meal plan
      await prisma.mealPlanItem.deleteMany({
        where: { mealPlanId: mealPlan.id },
      });

      await prisma.mealPlan.delete({
        where: { id: mealPlan.id },
      });
    }

    revalidatePath("/planning");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression",
    };
  }
}

/**
 * Met à jour uniquement le nombre de personnes pour un créneau
 */
export async function updatePeopleCount(
  date: Date,
  slot: "midi" | "soir",
  peopleCount: number
) {
  try {
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        date: date,
        slot: slot,
      },
    });

    if (mealPlan) {
      await prisma.mealPlan.update({
        where: { id: mealPlan.id },
        data: { peopleCount },
      });
    }

    revalidatePath("/planning");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise à jour",
    };
  }
}

/**
 * Marque un item de shopping list comme acheté
 */
export async function markItemAsPurchased(itemId: number, purchased: boolean) {
  try {
    await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        purchased,
        purchasedAt: purchased ? new Date() : null,
      },
    });

    revalidatePath("/shopping-list");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise à jour",
    };
  }
}

/**
 * Supprime tous les items achetés pour un magasin donné dans une shopping list
 */
export async function deleteCompletedItemsForStore(
  shoppingListId: number,
  storeName: string
) {
  try {
    // Récupérer tous les items achetés de ce magasin
    const itemsToDelete = await prisma.shoppingListItem.findMany({
      where: {
        shoppingListId,
        purchased: true,
        Ingredient: {
          storeName,
        },
      },
      select: { id: true },
    });

    // Supprimer les items
    await prisma.shoppingListItem.deleteMany({
      where: {
        id: { in: itemsToDelete.map((item) => item.id) },
      },
    });

    revalidatePath("/shopping-list");
    return { success: true, deletedCount: itemsToDelete.length };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression",
    };
  }
}

/**
 * Récupère une shopping list par son ID avec tous ses items agrégés
 */
export async function getShoppingListById(id: number) {
  try {
    const shoppingList = await prisma.shoppingList.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            Ingredient: true,
            MealPlan: {
              select: {
                date: true,
                slot: true,
              },
            },
          },
        },
      },
    });

    if (!shoppingList) {
      return { success: false, error: "Liste introuvable" };
    }

    // Agréger les items par ingrédient (même ingrédient = même ligne)
    const itemsMap = new Map<
      number,
      {
        id: number; // ID du premier item (pour le checkbox)
        name: string;
        quantity: number;
        unit: string;
        storeSection: string;
        storeName: string | null;
        purchased: boolean;
        mealPlans: Array<{ date: Date; slot: string }>;
        relatedItemIds: number[]; // Tous les IDs d'items agrégés
      }
    >();

    for (const item of shoppingList.items) {
      const ingredientId = item.ingredientId;

      if (itemsMap.has(ingredientId)) {
        const existing = itemsMap.get(ingredientId)!;
        existing.quantity += item.quantity;
        existing.mealPlans.push({
          date: item.MealPlan.date.toISOString(),
          slot: item.MealPlan.slot,
        });
        existing.relatedItemIds.push(item.id);
        // Si au moins un item n'est pas acheté, on considère que l'ingrédient n'est pas acheté
        if (!item.purchased) {
          existing.purchased = false;
        }
      } else {
        itemsMap.set(ingredientId, {
          id: item.id,
          name: item.Ingredient.nameNormalized,
          quantity: item.quantity,
          unit: item.unitCode,
          storeSection: item.Ingredient.storeSection,
          storeName: item.Ingredient.storeName,
          purchased: item.purchased,
          mealPlans: [{ date: item.MealPlan.date.toISOString(), slot: item.MealPlan.slot }],
          relatedItemIds: [item.id],
        });
      }
    }

    // Grouper par magasin puis par rayon
    const groupedByStore: Record<
      string,
      Record<string, typeof itemsMap extends Map<number, infer T> ? T[] : never>
    > = {};

    itemsMap.forEach((value) => {
      const storeName = value.storeName || "Sans magasin";
      const section = value.storeSection;

      if (!groupedByStore[storeName]) {
        groupedByStore[storeName] = {};
      }
      if (!groupedByStore[storeName][section]) {
        groupedByStore[storeName][section] = [];
      }
      groupedByStore[storeName][section].push(value);
    });

    return {
      success: true,
      data: {
        id: shoppingList.id,
        startDate: shoppingList.startDate.toISOString(),
        endDate: shoppingList.endDate.toISOString(),
        createdAt: shoppingList.createdAt.toISOString(),
        groupedByStore: groupedByStore,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la récupération",
    };
  }
}

/**
 * Génère la liste de courses pour une période donnée
 * Sauvegarde en BDD et exclut les items déjà achetés des repas planifiés
 */
export async function generateShoppingList(startDate: Date, endDate: Date) {
  try {
    // 1. Nettoyer les anciennes listes (>28 jours)
    const cleanupDate = new Date();
    cleanupDate.setDate(cleanupDate.getDate() - 28);
    await prisma.shoppingList.deleteMany({
      where: {
        createdAt: {
          lt: cleanupDate,
        },
      },
    });

    // 2. Récupérer tous les meal plans de la période
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
    });

    // 3. Créer la nouvelle liste de courses
    const shoppingList = await prisma.shoppingList.create({
      data: {
        startDate,
        endDate,
      },
    });

    // 4. Pour chaque meal plan, créer les items
    for (const mealPlan of mealPlans) {
      const peopleCount = mealPlan.peopleCount;

      for (const item of mealPlan.items) {
        for (const recipeIngredient of item.Recipe.ingredients) {
          const ingredientId = recipeIngredient.ingredientId;

          const qtyForMeal = recipeIngredient.qtyPerPerson * peopleCount;
          const recipeUnitCode = recipeIngredient.unitCode;
          const canonicalUnitCode = recipeIngredient.Ingredient.canonicalUnit;

          // Convertir vers l'unité canonique
          let convertedQty = qtyForMeal;
          let finalUnitCode = canonicalUnitCode;

          if (recipeUnitCode !== canonicalUnitCode) {
            const recipeUnit = recipeIngredient.Unit;
            if (recipeUnit && (recipeUnit.type === "mass" || recipeUnit.type === "volume")) {
              // Conversion via ratioToBase
              convertedQty = qtyForMeal * recipeUnit.ratioToBase;
            }
          }

          // Créer l'item de shopping list avec unité canonique
          await prisma.shoppingListItem.create({
            data: {
              shoppingListId: shoppingList.id,
              mealPlanId: mealPlan.id,
              ingredientId: ingredientId,
              quantity: convertedQty,
              unitCode: finalUnitCode,
            },
          });
        }
      }
    }

    revalidatePath("/shopping-list");
    return { success: true, shoppingListId: shoppingList.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la génération",
    };
  }
}
