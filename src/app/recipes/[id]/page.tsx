import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";
import RecipeDetail from "./RecipeDetail";
import AddToPlanningModal from "./AddToPlanningModal";

type RecipePageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const recipeId = parseInt(id, 10);

  if (isNaN(recipeId)) {
    notFound();
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      ingredients: {
        include: {
          Ingredient: true,
          Unit: true,
        },
        orderBy: [{ id: "asc" }],
      },
      steps: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!recipe) {
    notFound();
  }

  // Get steps from relation (RecipeStep table)
  const steps = recipe.steps.map((step) => step.text);

  // Parse tags
  const tags = Array.isArray(recipe.tags)
    ? recipe.tags
    : typeof recipe.tags === "string"
    ? recipe.tags.split(",").map((t) => t.trim())
    : [];

  return (
    <main className="max-w-4xl mx-auto space-y-6">
      {/* Hero Section */}
      <Card>
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-t-lg p-12 text-center">
            <div className="text-8xl mb-4">🍝</div>
            <h1 className="text-4xl font-bold text-white mb-3">{recipe.title}</h1>
            {recipe.description && (
              <p className="text-lg text-indigo-100 max-w-2xl mx-auto">{recipe.description}</p>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="p-6 pb-0">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RecipeDetail component (Temps + Nombre de personnes + Ingrédients) */}
      <RecipeDetail
        defaultServings={recipe.servingsDefault || 2}
        prepMin={recipe.prepMin}
        cookMin={recipe.cookMin}
        ingredients={recipe.ingredients}
      />

      {/* Steps Section */}
      {steps.length > 0 && (
        <Card>
          <CardContent>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Préparation</h2>
            <ol className="space-y-6">
              {steps.map((step, index) => {
                // Remove numbering if already present (e.g., "1) text" or "1. text")
                const cleanStep = step.replace(/^\d+[\.)]\s*/, "");

                return (
                  <li key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-base">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-lg text-gray-700 leading-relaxed">{cleanStep}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pb-6">
        <AddToPlanningModal
          recipeId={recipe.id}
          recipeTitle={recipe.title}
          servingsDefault={recipe.servingsDefault || 2}
        />
        <a href={`/recipes/${recipe.id}/edit`} className="flex-1">
          <Button variant="secondary" size="lg" fullWidth>
            <span className="mr-2">✏️</span>
            Modifier
          </Button>
        </a>
        <a href="/recipes" className="sm:flex-initial">
          <Button variant="secondary" size="lg">
            ← Retour
          </Button>
        </a>
      </div>
    </main>
  );
}
