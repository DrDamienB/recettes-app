import { prisma } from "@/lib/prisma";

type RecipeCard = { id: number; title: string; description: string | null };

export default async function RecipesPage() {
  const recipes: RecipeCard[] = await prisma.recipe.findMany({
    select: { id: true, title: true, description: true },
    orderBy: { id: "desc" },
  });

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Recettes</h1>
        <a href="/recipes/new" className="border px-3 py-2 rounded">+ Nouvelle recette</a>
      </div>
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
