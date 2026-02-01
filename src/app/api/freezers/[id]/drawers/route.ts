import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/freezers/[id]/drawers — Tiroirs d'un congélateur
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const drawers = await prisma.drawer.findMany({
      where: { freezerId: parseInt(id) },
      orderBy: { order: "asc" },
      include: { items: { orderBy: { expirationDate: "asc" } } },
    });
    return NextResponse.json(drawers);
  } catch (error) {
    console.error("Error fetching drawers:", error);
    return NextResponse.json(
      { error: "Failed to fetch drawers" },
      { status: 500 }
    );
  }
}

// POST /api/freezers/[id]/drawers — Créer un tiroir
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Le nom est requis" },
        { status: 400 }
      );
    }

    const maxOrder = await prisma.drawer.aggregate({
      where: { freezerId: parseInt(id) },
      _max: { order: true },
    });

    const drawer = await prisma.drawer.create({
      data: {
        name: name.trim(),
        order: (maxOrder._max.order ?? -1) + 1,
        freezerId: parseInt(id),
      },
      include: { items: true },
    });

    return NextResponse.json(drawer, { status: 201 });
  } catch (error) {
    console.error("Error creating drawer:", error);
    return NextResponse.json(
      { error: "Failed to create drawer" },
      { status: 500 }
    );
  }
}
