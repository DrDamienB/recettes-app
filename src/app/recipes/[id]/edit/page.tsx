"use client";

import { updateRecipe, type RecipeFormState } from "./actions";
import IngredientRows from "../../new/IngredientRows";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Input } from "@/components/ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" isLoading={pending} fullWidth>
      {pending ? "Enregistrement..." : "Enregistrer les modifications"}
    </Button>
  );
}

type RecipeEditPageProps = {
  params: Promise<{ id: string }>;
};

export default function RecipeEditPage({ params }: RecipeEditPageProps) {
  const router = useRouter();
  const [recipeId, setRecipeId] = useState<number | null>(null);
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Unwrap params
  useEffect(() => {
    params.then((p) => {
      const id = parseInt(p.id, 10);
      setRecipeId(id);

      // Fetch recipe data
      fetch(`/api/recipes/${id}`)
        .then(res => res.json())
        .then(data => {
          setRecipe(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Erreur lors du chargement de la recette:", err);
          setLoading(false);
        });
    });
  }, [params]);

  const [state, formAction] = useActionState<RecipeFormState | null, FormData>(
    (prevState, formData) => {
      if (recipeId === null) {
        return { success: false, error: "ID de recette invalide" };
      }
      return updateRecipe(recipeId, prevState, formData);
    },
    null
  );

  if (loading || !recipe) {
    return (
      <main className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </main>
    );
  }

  // Prepare default values
  const defaultTags = Array.isArray(recipe.tags) ? recipe.tags.join(", ") : "";
  const defaultSteps = recipe.steps?.map((s: any) => s.text).join("\n") || "";
  const defaultIngredients = recipe.ingredients?.map((ing: any) => ({
    name: ing.Ingredient.nameNormalized,
    qtyPerPerson: ing.qtyPerPerson,
    unitCode: ing.unitCode,
    storeSection: ing.Ingredient.storeSection,
    storeName: ing.Ingredient.storeName,
  })) || [];

  return (
    <main className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Modifier la recette</h1>
        <a href={`/recipes/${recipeId}`}>
          <Button variant="secondary" size="md">
            Annuler
          </Button>
        </a>
      </div>

      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-medium">Erreur :</p>
          <p>{state.error}</p>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <Input
          name="title"
          label="Titre"
          placeholder="Ex: Pâtes carbonara"
          required
          fullWidth
          className="h-12"
          defaultValue={recipe.title}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[96px]"
            rows={2}
            placeholder="Décrivez votre recette..."
            defaultValue={recipe.description || ""}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            name="prepMin"
            type="number"
            label="Préparation (min)"
            placeholder="15"
            hint="Temps de préparation"
            className="h-12"
            defaultValue={recipe.prepMin || ""}
          />
          <Input
            name="cookMin"
            type="number"
            label="Cuisson (min)"
            placeholder="10"
            hint="Temps de cuisson"
            className="h-12"
            defaultValue={recipe.cookMin || ""}
          />
          <Input
            name="servingsDefault"
            type="number"
            label="Portions"
            defaultValue={recipe.servingsDefault || "2"}
            required
            hint="Nombre de personnes"
            className="h-12"
          />
        </div>

        <Input
          name="tags"
          label="Tags"
          placeholder="pates, rapide, italien"
          hint="Séparés par des virgules"
          fullWidth
          className="h-12"
          defaultValue={defaultTags}
        />

        <div className="space-y-2">
          <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
            Magasin préféré
          </label>
          <select
            id="storeName"
            name="storeName"
            defaultValue={recipe.ingredients?.[0]?.Ingredient?.storeName || "Auchan"}
            className="w-full h-12 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Fresh">Fresh</option>
            <option value="Asiatique">Asiatique</option>
            <option value="Primeur">Primeur</option>
            <option value="Auchan">Auchan</option>
            <option value="Carrefour">Carrefour</option>
            <option value="Leclerc">Leclerc</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ingrédients (par personne)
          </label>
          <IngredientRows defaultIngredients={defaultIngredients} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Étapes de préparation
          </label>
          <textarea
            name="steps"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[144px]"
            rows={5}
            placeholder={"1) Faire bouillir l'eau\n2) Cuire les pâtes 9 min\n3) Mélanger et servir"}
            defaultValue={defaultSteps}
          />
        </div>

        <div className="flex gap-3">
          <SubmitButton />
          <a href={`/recipes/${recipeId}`} className="flex-1">
            <Button variant="secondary" size="lg" fullWidth>
              Annuler
            </Button>
          </a>
        </div>
      </form>
    </main>
  );
}
