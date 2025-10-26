import { prisma } from "@/lib/prisma";

export default async function RecipesPage() {
  const recipes = await prisma.recipe.findMany();
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Recettes</h1>
      <ul className="space-y-2">
        {recipes.map((r) => (
          <li key={r.id} className="border p-3 rounded">
            <div className="font-medium">{r.title}</div>
            <div className="text-sm opacity-70">{r.description}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
