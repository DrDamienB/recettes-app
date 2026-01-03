"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteRecipe(recipeId: number) {
  try {
    // Vérifier si la recette est utilisée dans des plannings
    const mealPlans = await prisma.mealPlanItem.findMany({
      where: { recipeId },
      include: {
        mealPlan: {
          include: { date: true }
        }
      }
    });

    if (mealPlans.length > 0) {
      // Retourner la liste des plannings affectés
      return {
        success: false,
        affectedPlans: mealPlans.map(mp => ({
          date: mp.mealPlan.date.toISOString(),
          slot: mp.mealPlan.slot
        })),
        message: `Cette recette est utilisée dans ${mealPlans.length} planning(s). Confirmez pour supprimer.`
      };
    }

    // Suppression (cascade automatique pour steps, ingredients, recurrence rules)
    await prisma.recipe.delete({
      where: { id: recipeId }
    });

    revalidatePath("/recipes");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression"
    };
  }
}

export async function forceDeleteRecipe(recipeId: number) {
  try {
    // Supprimer d'abord les meal plan items
    await prisma.mealPlanItem.deleteMany({
      where: { recipeId }
    });

    // Puis la recette (cascade automatique pour steps, ingredients, rules)
    await prisma.recipe.delete({
      where: { id: recipeId }
    });

    revalidatePath("/recipes");
    revalidatePath("/planning");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression"
    };
  }
}
