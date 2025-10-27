import { createRecipe } from "./actions";
import IngredientRows from "./IngredientRows";

export default function NewRecipePage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Nouvelle recette</h1>
      <form action={createRecipe} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm">Titre *</label>
          <input name="title" className="border rounded p-2 w-full" required />
        </div>
        <div>
          <label className="block text-sm">Description</label>
          <textarea name="description" className="border rounded p-2 w-full" rows={2} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm">Préparation (min)</label>
            <input name="prepMin" type="number" className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm">Cuisson (min)</label>
            <input name="cookMin" type="number" className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm">Portions défaut</label>
            <input name="servingsDefault" type="number" defaultValue={2} className="border rounded p-2 w-full" />
          </div>
        </div>

        <div>
          <label className="block text-sm">Tags (séparés par des virgules)</label>
          <input name="tags" className="border rounded p-2 w-full" placeholder="pates, rapide, italien" />
        </div>

        <div>
          <label className="block text-sm mb-1">Ingrédients (par personne)</label>
          <IngredientRows />
        </div>

        <div>
          <label className="block text-sm">Étapes (une par ligne)</label>
          <textarea name="steps" className="border rounded p-2 w-full" rows={5}
            placeholder={"1) Faire bouillir l'eau\n2) Cuire les pâtes 9 min\n3) Mélanger et servir"} />
        </div>

        <button className="bg-black text-white px-4 py-2 rounded">Enregistrer</button>
      </form>
    </main>
  );
}
