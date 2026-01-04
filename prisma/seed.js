// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // UNITÉS avec formes d'accord
  const units = [
    { code: "g", type: "mass", ratioToBase: 1, singularForm: "g", pluralForm: "g", gender: "m" },
    { code: "kg", type: "mass", ratioToBase: 1000, singularForm: "kg", pluralForm: "kg", gender: "m" },
    { code: "mL", type: "volume", ratioToBase: 1, singularForm: "mL", pluralForm: "mL", gender: "m" },
    { code: "L", type: "volume", ratioToBase: 1000, singularForm: "L", pluralForm: "L", gender: "m" },
    { code: "piece", type: "count", ratioToBase: 1, singularForm: "pièce", pluralForm: "pièces", gender: "f" },
    { code: "cac", type: "volume", ratioToBase: 5, singularForm: "c.à.c", pluralForm: "c.à.c", gender: "f" },
    { code: "cas", type: "volume", ratioToBase: 15, singularForm: "c.à.s", pluralForm: "c.à.s", gender: "f" },
  ];

  console.log("📏 Creating units...");
  for (const u of units) {
    await prisma.unit.upsert({
      where: { code: u.code },
      update: {
        singularForm: u.singularForm,
        pluralForm: u.pluralForm,
        gender: u.gender,
      },
      create: { ...u },
    });
  }
  console.log("✅ Units created");

  // UTILISATEUR PAR DÉFAUT
  console.log("👤 Creating admin user...");
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
    },
  });
  console.log("✅ Seed user created: admin (password: admin123)");

  // INGRÉDIENTS
  console.log("🥕 Creating sample ingredients...");
  const farine = await prisma.ingredient.upsert({
    where: { nameNormalized: "farine" },
    update: {},
    create: {
      nameNormalized: "farine",
      canonicalUnit: "g",
      storeSection: "sucré",
      storeName: "Supermarché",
      synonyms: [],
    },
  });

  const lait = await prisma.ingredient.upsert({
    where: { nameNormalized: "lait" },
    update: {},
    create: {
      nameNormalized: "lait",
      canonicalUnit: "mL",
      storeSection: "crèmerie",
      storeName: "Supermarché",
      synonyms: [],
    },
  });

  const oeuf = await prisma.ingredient.upsert({
    where: { nameNormalized: "oeuf" },
    update: {},
    create: {
      nameNormalized: "oeuf",
      canonicalUnit: "piece",
      storeSection: "crèmerie",
      storeName: "Supermarché",
      synonyms: ["œuf"],
    },
  });

  const beurre = await prisma.ingredient.upsert({
    where: { nameNormalized: "beurre" },
    update: {},
    create: {
      nameNormalized: "beurre",
      canonicalUnit: "g",
      storeSection: "crèmerie",
      storeName: "Supermarché",
      synonyms: [],
    },
  });
  console.log("✅ Ingredients created");

  // RECETTE
  console.log("📖 Creating sample recipe...");
  const crepes = await prisma.recipe.upsert({
    where: { slug: "crepes-sucrees" },
    update: {},
    create: {
      title: "Crêpes sucrées",
      slug: "crepes-sucrees",
      description: "Crêpes classiques, parfaites pour le vendredi soir",
      servingsDefault: 4,
      tags: ["dessert", "vendredi"],
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

  // RÉCURRENCE
  await prisma.recurrenceRule.create({
    data: {
      recipeId: crepes.id,
      slot: "soir",
      rruleText: "FREQ=WEEKLY;BYDAY=FR;BYHOUR=19",
      startDate: new Date(),
    },
  });
  console.log("✅ Recipe created");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
