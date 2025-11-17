"use client";

import { createRecipe, type RecipeFormState } from "./actions";
import IngredientRows from "./IngredientRows";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Input } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" isLoading={pending} fullWidth>
      {pending ? "Enregistrement..." : "Enregistrer"}
    </Button>
  );
}

export default function NewRecipePage() {
  const [state, formAction] = useActionState<RecipeFormState | null, FormData>(
    createRecipe,
    null
  );

  return (
    <main className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Nouvelle recette</h1>
        <a href="/recipes/import">
          <Button variant="secondary" size="md" className="border-2 flex items-center gap-2">
            <span>🔗</span>
            <span>Importer depuis une URL</span>
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
          className="h-11"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[96px]"
            rows={2}
            placeholder="Décrivez votre recette..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            name="prepMin"
            type="number"
            label="Préparation (min)"
            placeholder="15"
            hint="Temps de préparation"
            className="h-11"
          />
          <Input
            name="cookMin"
            type="number"
            label="Cuisson (min)"
            placeholder="10"
            hint="Temps de cuisson"
            className="h-11"
          />
          <Input
            name="servingsDefault"
            type="number"
            label="Portions"
            defaultValue="2"
            required
            hint="Nombre de personnes"
            className="h-11"
          />
        </div>

        <Input
          name="tags"
          label="Tags"
          placeholder="pates, rapide, italien"
          hint="Séparés par des virgules"
          fullWidth
          className="h-11"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ingrédients (par personne)
          </label>
          <IngredientRows />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Étapes de préparation
          </label>
          <textarea
            name="steps"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[144px]"
            rows={5}
            placeholder={"1) Faire bouillir l'eau\n2) Cuire les pâtes 9 min\n3) Mélanger et servir"}
          />
        </div>

        <SubmitButton />
      </form>
    </main>
  );
}
