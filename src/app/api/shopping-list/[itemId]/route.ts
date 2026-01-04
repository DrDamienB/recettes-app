import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId: itemIdStr } = await params;
    const itemId = parseInt(itemIdStr);
    const body = await request.json();
    const { purchased } = body;

    await prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        purchased,
        purchasedAt: purchased ? new Date() : null,
      },
    });

    revalidatePath("/shopping-list");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating shopping list item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update item" },
      { status: 500 }
    );
  }
}
