"use client";

import { useState } from "react";
import { importRecipeFromUrl, type ImportedRecipe } from "./actions";
import { Button, Input } from "@/components/ui";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function ImportRecipePage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [importedRecipe, setImportedRecipe] = useState<ImportedRecipe | null>(null);

  // Éditable form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [prepMin, setPrepMin] = useState("");
  const [cookMin, setCookMin] = useState("");
  const [servings, setServings] = useState("");

  const handleImport = async () => {
    if (!url.trim()) {
      setError("Veuillez entrer une URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setImportedRecipe(null);

    const result = await importRecipeFromUrl(url);

    setIsLoading(false);

    if (result.success && result.data) {
      setImportedRecipe(result.data);
      // Populate editable fields
      setTitle(result.data.title);
      setDescription(result.data.description || "");
      setIngredients(result.data.ingredients.join("\n"));
      setSteps(result.data.steps.join("\n"));
      setPrepMin(result.data.prepMin?.toString() || "");
      setCookMin(result.data.cookMin?.toString() || "");
      setServings(result.data.servings?.toString() || "");
    } else {
      setError(result.error || "Erreur lors de l'import");
    }
  };

  const handleSave = () => {
    // TODO: Save to database
    console.log("Saving recipe:", {
      title,
      description,
      ingredients: ingredients.split("\n").filter((i) => i.trim()),
      steps: steps.split("\n").filter((s) => s.trim()),
      prepMin: prepMin ? parseInt(prepMin) : undefined,
      cookMin: cookMin ? parseInt(cookMin) : undefined,
      servings: servings ? parseInt(servings) : undefined,
    });
    alert("Fonctionnalité de sauvegarde à venir !");
  };

  return (
    <main className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Importer une recette</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>URL de la recette</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="URL"
              placeholder="https://www.marmiton.org/recettes/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              fullWidth
              hint="Sites supportés : Marmiton, 750g"
            />

            <Button onClick={handleImport} isLoading={isLoading} fullWidth>
              {isLoading ? "Import en cours..." : "Importer"}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                <p className="font-medium">Erreur :</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {importedRecipe && (
        <Card>
          <CardHeader>
            <CardTitle>Recette importée - Vérifiez et modifiez si nécessaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Titre"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Préparation (min)"
                  type="number"
                  value={prepMin}
                  onChange={(e) => setPrepMin(e.target.value)}
                />
                <Input
                  label="Cuisson (min)"
                  type="number"
                  value={cookMin}
                  onChange={(e) => setCookMin(e.target.value)}
                />
                <Input
                  label="Portions"
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ingrédients
                  <span className="text-xs text-gray-500 ml-2">(un par ligne)</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  rows={10}
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Étapes de préparation
                  <span className="text-xs text-gray-500 ml-2">(une par ligne)</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-sm">
                <p className="font-medium mb-1">Source :</p>
                <a
                  href={importedRecipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900"
                >
                  {importedRecipe.sourceUrl}
                </a>
              </div>

              <Button onClick={handleSave} fullWidth>
                Enregistrer la recette
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
