import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/freezers/[id] — Renommer un congélateur
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, order } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (order !== undefined) data.order = order;

    const freezer = await prisma.freezer.update({
      where: { id: parseInt(id) },
      data,
      include: { drawers: { include: { items: true } } },
    });

    return NextResponse.json(freezer);
  } catch (error) {
    console.error("Error updating freezer:", error);
    return NextResponse.json(
      { error: "Failed to update freezer" },
      { status: 500 }
    );
  }
}

// DELETE /api/freezers/[id] — Supprimer un congélateur (cascade tiroirs + items)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.freezer.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting freezer:", error);
    return NextResponse.json(
      { error: "Failed to delete freezer" },
      { status: 500 }
    );
  }
}
