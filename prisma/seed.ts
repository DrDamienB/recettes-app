// prisma/seed.ts
import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // === UNITÉS ===
  // NB: on ENLÈVE skipDuplicates (problème de typage avec Prisma 6)
  await prisma.unit.createMany({
    data: [
      { code: "g", type: "mass", ratioToBase: 1 },
      { code: "kg", type: "mass", ratioToBase: 1000 },
      { code: "mL", type: "volume", ratioToBase: 1 },
      { code: "L", type: "volume", ratioToBase: 1000 },
      { code: "piece", type: "count", ratioToBase: 1 },
      { code: "cac", type: "volume", ratioToBase: 5 },   // cuillère à café
      { code: "cas", type: "volume", ratioToBase: 15 },  // cuillère à soupe
    ],
  });

  // === INGRÉDIENTS de base ===
  const farine = await prisma.ingredient.upsert({
    where: { nameNormalized: "farine" },
    update: {},
    create: {
      nameNormalized: "farine",
      canonicalUnit: "g",
      storeSection: "sucré",
      synonyms: [] as Prisma.JsonArray,
    },
  });

  const lait = await prisma.ingredient.upsert({
    where: { nameNormalized: "lait" },
    update: {},
    create: {
      nameNormalized: "lait",
      canonicalUnit: "mL",
      storeSection: "crèmerie",
      synonyms: [] as Prisma.JsonArray,
    },
  });

  const oeuf = await prisma.ingredient.upsert({
    where: { nameNormalized: "oeuf" },
    update: {},
    create: {
      nameNormalized: "oeuf",
      canonicalUnit: "piece",
      storeSection: "crèmerie",
      synonyms: ["œuf"] as unknown as Prisma.JsonArray,
    },
  });

  const beurre = await prisma.ingredient.upsert({
    where: { nameNormalized: "beurre" },
    update: {},
    create: {
      nameNormalized: "beurre",
      canonicalUnit: "g",
      storeSection: "crèmerie",
      synonyms: [] as Prisma.JsonArray,
    },
  });

  // === RECETTE démo : Crêpes sucrées ===
  const crepes = await prisma.recipe.upsert({
    where: { slug: "crepes-sucrees" },
    update: {},
    create: {
      title: "Crêpes sucrées",
      slug: "crepes-sucrees",
      description: "Crêpes classiques, parfaites pour le vendredi soir",
      servingsDefault: 4,
      tags: ["dessert", "vendredi"] as unknown as Prisma.JsonArray,
      steps: {
        create: [
          { order: 1, text: "Mélanger farine, œufs, lait, beurre fondu." },
          { order: 2, text: "Repos 30 min puis cuire à la poêle." },
        ],
      },
      ingredients: {
        create: [
          { ingredientId: farine.id, qtyPerPerson: 25, unitCode: "g" },
          { ingredientId: lait.id,   qtyPerPerson: 75, unitCode: "mL" },
          { ingredientId: oeuf.id,   qtyPerPerson: 0.5, unitCode: "piece" },
          { ingredientId: beurre.id, qtyPerPerson: 5,  unitCode: "g" },
        ],
      },
    },
  });

  // === RÉCURRENCE démo ===
  await prisma.recurrenceRule.create({
    data: {
      recipeId: crepes.id,
      slot: "soir",
      rruleText: "FREQ=WEEKLY;BYDAY=FR;BYHOUR=19",
      startDate: new Date(),
    },
  });

  console.log("✅ Seed done.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
