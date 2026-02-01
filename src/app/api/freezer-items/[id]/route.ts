import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/freezer-items/[id] — Modifier un item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, type, quantity, expirationDate, drawerId } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title.trim();
    if (type !== undefined) data.type = type;
    if (quantity !== undefined) data.quantity = quantity;
    if (expirationDate !== undefined) data.expirationDate = new Date(expirationDate);
    if (drawerId !== undefined) data.drawerId = parseInt(drawerId);

    const item = await prisma.freezerItem.update({
      where: { id: parseInt(id) },
      data,
      include: { drawer: { include: { freezer: true } } },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating freezer item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE /api/freezer-items/[id] — Supprimer un item
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.freezerItem.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting freezer item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
