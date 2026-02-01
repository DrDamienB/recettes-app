import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/freezer-items/expiring — Items qui périment dans les 15 prochains jours
export async function GET() {
  try {
    const now = new Date();
    const in15Days = new Date();
    in15Days.setDate(in15Days.getDate() + 15);

    const expiringItems = await prisma.freezerItem.findMany({
      where: {
        expirationDate: {
          lte: in15Days,
          gte: now,
        },
      },
      include: {
        drawer: {
          include: { freezer: true },
        },
      },
      orderBy: { expirationDate: "asc" },
    });

    const expiredItems = await prisma.freezerItem.findMany({
      where: {
        expirationDate: { lt: now },
      },
      include: {
        drawer: {
          include: { freezer: true },
        },
      },
      orderBy: { expirationDate: "asc" },
    });

    return NextResponse.json({
      expiring: expiringItems,
      expired: expiredItems,
      totalUrgent: expiringItems.length + expiredItems.length,
    });
  } catch (error) {
    console.error("Error checking expiring items:", error);
    return NextResponse.json({ error: "Failed to check" }, { status: 500 });
  }
}
