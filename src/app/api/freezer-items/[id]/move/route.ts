import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/freezer-items/[id]/move — Déplacer un item vers un autre tiroir
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { drawerId } = body;

    if (!drawerId) {
      return NextResponse.json(
        { error: "drawerId est requis" },
        { status: 400 }
      );
    }

    // Vérifier que le tiroir cible existe
    const drawer = await prisma.drawer.findUnique({
      where: { id: parseInt(drawerId) },
    });

    if (!drawer) {
      return NextResponse.json(
        { error: "Tiroir introuvable" },
        { status: 404 }
      );
    }

    const item = await prisma.freezerItem.update({
      where: { id: parseInt(id) },
      data: { drawerId: parseInt(drawerId) },
      include: { drawer: { include: { freezer: true } } },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error moving freezer item:", error);
    return NextResponse.json(
      { error: "Failed to move item" },
      { status: 500 }
    );
  }
}
