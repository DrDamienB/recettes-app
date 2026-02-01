import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/freezer-items — Liste avec filtres optionnels
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const freezerId = searchParams.get("freezerId");
    const sort = searchParams.get("sort") || "expiration";

    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }
    if (search) {
      where.title = { contains: search };
    }
    if (freezerId) {
      where.drawer = { freezerId: parseInt(freezerId) };
    }

    const orderBy =
      sort === "type"
        ? { type: "asc" as const }
        : sort === "name"
        ? { title: "asc" as const }
        : { expirationDate: "asc" as const };

    const items = await prisma.freezerItem.findMany({
      where,
      orderBy,
      include: {
        drawer: {
          include: { freezer: true },
        },
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching freezer items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

// POST /api/freezer-items — Créer un item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type, quantity, expirationDate, drawerId } = body;

    if (!title?.trim() || !type || !drawerId || !expirationDate) {
      return NextResponse.json(
        { error: "Champs requis : title, type, drawerId, expirationDate" },
        { status: 400 }
      );
    }

    const item = await prisma.freezerItem.create({
      data: {
        title: title.trim(),
        type,
        quantity: quantity || 1,
        expirationDate: new Date(expirationDate),
        drawerId: parseInt(drawerId),
      },
      include: { drawer: { include: { freezer: true } } },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating freezer item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
