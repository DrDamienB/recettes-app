import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/freezers/[id]/drawers/[drawerId] — Renommer/réordonner un tiroir
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; drawerId: string }> }
) {
  try {
    const { drawerId } = await params;
    const body = await request.json();
    const { name, order } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (order !== undefined) data.order = order;

    const drawer = await prisma.drawer.update({
      where: { id: parseInt(drawerId) },
      data,
      include: { items: true },
    });

    return NextResponse.json(drawer);
  } catch (error) {
    console.error("Error updating drawer:", error);
    return NextResponse.json(
      { error: "Failed to update drawer" },
      { status: 500 }
    );
  }
}

// DELETE /api/freezers/[id]/drawers/[drawerId] — Supprimer un tiroir (cascade items)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; drawerId: string }> }
) {
  try {
    const { drawerId } = await params;
    await prisma.drawer.delete({ where: { id: parseInt(drawerId) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting drawer:", error);
    return NextResponse.json(
      { error: "Failed to delete drawer" },
      { status: 500 }
    );
  }
}
