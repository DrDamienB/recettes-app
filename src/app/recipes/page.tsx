import { prisma } from "@/lib/prisma";

type RecipeCard = { id: number; title: string; description: string | null };

export default async function RecipesPage() {
  // On sélectionne seulement les champs utiles pour typer proprement
  const recipes: RecipeCard[] = await prisma.recipe.findMany({
    select: { id: true, title: true, description: true },
  });

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Recettes</h1>
      <ul className="space-y-2">
        {recipes.map((r: RecipeCard) => (
          <li key={r.id} className="border p-3 rounded">
            <div className="font-medium">{r.title}</div>
            <div className="text-sm opacity-70">{r.description}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
