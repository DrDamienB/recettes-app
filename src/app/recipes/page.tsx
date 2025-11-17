import { prisma } from "@/lib/prisma";
import Button from "@/components/ui/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import SearchBar from "./SearchBar";

type RecipeCard = {
  id: number;
  title: string;
  description: string | null;
  servingsDefault: number | null;
  tags: unknown;
  imagePath: string | null;
};

type RecipesPageProps = {
  searchParams: Promise<{ q?: string; page?: string; tag?: string }>;
};

const RECIPES_PER_PAGE = 20;

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const selectedTag = params.tag || "";
  const currentPage = parseInt(params.page || "1", 10);

  // Récupérer toutes les recettes
  const allRecipes: RecipeCard[] = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      servingsDefault: true,
      tags: true,
      imagePath: true,
    },
    orderBy: { id: "desc" },
  });

  // Filtrer côté serveur (insensible à la casse)
  const filteredRecipes = allRecipes.filter((recipe) => {
    // Filtre par recherche textuelle
    if (query) {
      const searchLower = query.toLowerCase();
      const titleMatch = recipe.title.toLowerCase().includes(searchLower);
      const descMatch = recipe.description?.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) return false;
    }

    // Filtre par tag
    if (selectedTag) {
      const tags = Array.isArray(recipe.tags)
        ? recipe.tags
        : typeof recipe.tags === "string"
        ? recipe.tags.split(",").map((t) => t.trim())
        : [];
      const hasTag = tags.some((tag: string) => tag.toLowerCase() === selectedTag.toLowerCase());
      if (!hasTag) return false;
    }

    return true;
  });

  const totalRecipes = allRecipes.length;
  const totalFiltered = filteredRecipes.length;
  const hasSearch = query.length > 0;

  // Pagination
  const totalPages = Math.ceil(totalFiltered / RECIPES_PER_PAGE);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const startIndex = (validPage - 1) * RECIPES_PER_PAGE;
  const endIndex = startIndex + RECIPES_PER_PAGE;
  const recipes = filteredRecipes.slice(startIndex, endIndex);

  // Extraire tous les tags uniques
  const allTags = Array.from(
    new Set(
      allRecipes.flatMap((recipe) => {
        const tags = Array.isArray(recipe.tags)
          ? recipe.tags
          : typeof recipe.tags === "string"
          ? recipe.tags.split(",").map((t) => t.trim())
          : [];
        return tags;
      })
    )
  ).sort();

  // URLs de pagination et filtres
  const buildPageUrl = (page: number, tag?: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (tag) params.set("tag", tag);
    else if (selectedTag) params.set("tag", selectedTag);
    if (page > 1) params.set("page", page.toString());
    const queryString = params.toString();
    return `/recipes${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <main>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Recettes</h1>
          <p className="text-sm text-gray-600 mt-1">
            {hasSearch ? (
              <>
                {totalFiltered} résultat{totalFiltered > 1 ? "s" : ""} sur {totalRecipes}{" "}
                {totalRecipes > 1 ? "recettes" : "recette"}
              </>
            ) : (
              <>
                {totalRecipes} {totalRecipes > 1 ? "recettes" : "recette"}
              </>
            )}
            {totalPages > 1 && (
              <span className="ml-2">
                • Page {validPage} sur {totalPages}
              </span>
            )}
          </p>
        </div>
        <a href="/recipes/new">
          <Button>+ Nouvelle recette</Button>
        </a>
      </div>

      {/* Barre de recherche */}
      <div className="mb-4">
        <SearchBar initialQuery={query} />
      </div>

      {/* Filtres par tags */}
      {allTags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Tags :</span>
            <a
              href={buildPageUrl(1, "")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !selectedTag
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tous
            </a>
            {allTags.map((tag: string) => (
              <a
                key={tag}
                href={buildPageUrl(1, tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
      )}

      {totalRecipes === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📝</div>
              <CardTitle className="mb-2">Aucune recette</CardTitle>
              <CardDescription className="mb-4">
                Commencez par créer votre première recette
              </CardDescription>
              <a href="/recipes/new">
                <Button>Créer une recette</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      ) : recipes.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <CardTitle className="mb-2">Aucune recette trouvée</CardTitle>
              <CardDescription className="mb-4">
                Aucune recette ne correspond à votre recherche &quot;{query}&quot;
              </CardDescription>
              <a href="/recipes">
                <Button variant="secondary">Effacer la recherche</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => {
              const tags = Array.isArray(recipe.tags)
                ? recipe.tags
                : typeof recipe.tags === "string"
                ? recipe.tags.split(",").map((t) => t.trim())
                : [];

              return (
                <a key={recipe.id} href={`/recipes/${recipe.id}`} className="block">
                  <Card hover className="h-full transition-transform hover:scale-[1.02]">
                    {recipe.imagePath && (
                      <div className="w-full h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={recipe.imagePath}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle as="h3">{recipe.title}</CardTitle>
                      {recipe.description && (
                        <CardDescription>{recipe.description}</CardDescription>
                      )}
                    </CardHeader>

                    <CardContent>
                      {recipe.servingsDefault && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <span>👥 {recipe.servingsDefault} personnes</span>
                        </div>
                      )}

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <a href={buildPageUrl(validPage - 1)}>
                <Button
                  variant="secondary"
                  size="md"
                  disabled={validPage === 1}
                  className={validPage === 1 ? "pointer-events-none" : ""}
                >
                  ← Précédent
                </Button>
              </a>

              <span className="text-sm text-gray-600 font-medium">
                Page {validPage} sur {totalPages}
              </span>

              <a href={buildPageUrl(validPage + 1)}>
                <Button
                  variant="secondary"
                  size="md"
                  disabled={validPage === totalPages}
                  className={validPage === totalPages ? "pointer-events-none" : ""}
                >
                  Suivant →
                </Button>
              </a>
            </div>
          )}
        </>
      )}
    </main>
  );
}
