import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/freezers — Liste tous les congélateurs avec tiroirs et items
export async function GET() {
  try {
    const freezers = await prisma.freezer.findMany({
      orderBy: { order: "asc" },
      include: {
        drawers: {
          orderBy: { order: "asc" },
          include: {
            items: {
              orderBy: { expirationDate: "asc" },
            },
          },
        },
      },
    });
    return NextResponse.json(freezers);
  } catch (error) {
    console.error("Error fetching freezers:", error);
    return NextResponse.json(
      { error: "Failed to fetch freezers" },
      { status: 500 }
    );
  }
}

// POST /api/freezers — Créer un congélateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Le nom est requis" },
        { status: 400 }
      );
    }

    const maxOrder = await prisma.freezer.aggregate({ _max: { order: true } });
    const freezer = await prisma.freezer.create({
      data: {
        name: name.trim(),
        order: (maxOrder._max.order ?? -1) + 1,
      },
      include: { drawers: { include: { items: true } } },
    });

    return NextResponse.json(freezer, { status: 201 });
  } catch (error) {
    console.error("Error creating freezer:", error);
    return NextResponse.json(
      { error: "Failed to create freezer" },
      { status: 500 }
    );
  }
}
