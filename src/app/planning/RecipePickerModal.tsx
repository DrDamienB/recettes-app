"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type Recipe = {
  id: number;
  title: string;
  slug: string;
};

type RecipePickerModalProps = {
  recipes: Recipe[];
  selectedRecipeId: number | null;
  onSelect: (recipeId: number | null) => void;
  label: string;
  slot: "midi" | "soir";
};

export default function RecipePickerModal({
  recipes,
  selectedRecipeId,
  onSelect,
  label,
  slot,
}: RecipePickerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (recipeId: number | null) => {
    onSelect(recipeId);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full px-3 py-2 text-left text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
      >
        {selectedRecipe ? (
          <span className="text-gray-900">{selectedRecipe.title}</span>
        ) : (
          <span className="text-gray-500">Choisir une recette...</span>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {label} - Choisir une recette
                </h2>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Fermer"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Rechercher une recette..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            {/* Recipe List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {/* Option to clear selection */}
                {selectedRecipeId && (
                  <button
                    onClick={() => handleSelect(null)}
                    className="w-full text-left px-4 py-3 rounded-lg border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <span className="font-medium text-red-700">❌ Supprimer la recette</span>
                  </button>
                )}

                {/* Recipe list */}
                {filteredRecipes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune recette trouvée
                  </div>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleSelect(recipe.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                        recipe.id === selectedRecipeId
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{recipe.title}</span>
                        {recipe.id === selectedRecipeId && (
                          <span className="text-indigo-600">✓</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery("");
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
