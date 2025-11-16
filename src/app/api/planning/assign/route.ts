import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, slot, recipeId, peopleCount } = body;

    // Validation
    if (!date || !slot || !recipeId || !peopleCount) {
      return NextResponse.json(
        { message: "Paramètres manquants" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    // Vérifier si un meal plan existe déjà pour cette date/slot
    let mealPlan = await prisma.mealPlan.findFirst({
      where: {
        date: parsedDate,
        slot,
      },
    });

    if (mealPlan) {
      // Supprimer les anciens items
      await prisma.mealPlanItem.deleteMany({
        where: { mealPlanId: mealPlan.id },
      });

      // Mettre à jour le peopleCount
      mealPlan = await prisma.mealPlan.update({
        where: { id: mealPlan.id },
        data: {
          peopleCount: Number(peopleCount),
          items: {
            create: {
              recipeId: Number(recipeId),
            },
          },
        },
      });
    } else {
      // Créer un nouveau meal plan
      mealPlan = await prisma.mealPlan.create({
        data: {
          date: parsedDate,
          slot,
          peopleCount: Number(peopleCount),
          items: {
            create: {
              recipeId: Number(recipeId),
            },
          },
        },
      });
    }

    return NextResponse.json({ success: true, mealPlan });
  } catch (error) {
    console.error("Erreur lors de l'ajout au planning:", error);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
