import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les unités
    const units = await prisma.unit.findMany({
      orderBy: { code: "asc" },
    });

    // Récupérer les magasins
    const stores = await prisma.store.findMany({
      orderBy: { order: "asc" },
    });

    // Récupérer les appareils de l'utilisateur
    const devices = await prisma.device.findMany({
      where: { userId: session.userId },
      orderBy: { lastSeenAt: "desc" },
    });

    return NextResponse.json({ units, stores, devices });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
