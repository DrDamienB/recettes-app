"use client";

import { useState } from "react";
import Card, { CardContent } from "@/components/ui/Card";

type Ingredient = {
  id: number;
  qtyPerPerson: number;
  unitCode: string;
  Ingredient: {
    nameNormalized: string;
  };
  Unit: {
    name: string;
  } | null;
};

type RecipeDetailProps = {
  defaultServings: number;
  prepMin: number | null;
  cookMin: number | null;
  ingredients: Ingredient[];
};

function formatQuantity(qty: number): string {
  return Number.isInteger(qty) ? qty.toString() : qty.toFixed(1);
}

export default function RecipeDetail({
  defaultServings,
  prepMin,
  cookMin,
  ingredients,
}: RecipeDetailProps) {
  const [servings, setServings] = useState(defaultServings);

  const totalMin = (prepMin || 0) + (cookMin || 0);

  // Calculer les quantités ajustées pour tous les ingrédients
  const adjustedIngredients = ingredients.map((ing) => ({
    name: ing.Ingredient.nameNormalized,
    quantity: ing.qtyPerPerson * servings,
    unit: ing.Unit?.name || ing.unitCode,
  }));

  return (
    <>
      {/* Section Temps */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⏱️ Temps de préparation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Préparation */}
            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200 shadow-sm">
              <div className="text-3xl mb-2">⏰</div>
              <div className="text-sm text-gray-600 mb-1">Préparation</div>
              <div className="text-2xl font-bold text-gray-900">
                {prepMin ? `${prepMin} min` : "—"}
              </div>
            </div>

            {/* Cuisson */}
            <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-200 shadow-sm">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-sm text-gray-600 mb-1">Cuisson</div>
              <div className="text-2xl font-bold text-gray-900">
                {cookMin ? `${cookMin} min` : "—"}
              </div>
            </div>

            {/* Total */}
            <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200 shadow-sm">
              <div className="text-3xl mb-2">⏲️</div>
              <div className="text-sm text-gray-600 mb-1">Total</div>
              <div className="text-2xl font-bold text-gray-900">
                {totalMin > 0 ? `${totalMin} min` : "—"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Nombre de personnes */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <h3 className="text-lg font-medium text-gray-700">👥 Nombre de personnes</h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-bold text-gray-700 flex items-center justify-center text-xl"
                aria-label="Diminuer le nombre de personnes"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 sm:w-20 h-10 sm:h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setServings(servings + 1)}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-bold text-gray-700 flex items-center justify-center text-xl"
                aria-label="Augmenter le nombre de personnes"
              >
                +
              </button>
            </div>
            {servings !== defaultServings && (
              <button
                type="button"
                onClick={() => setServings(defaultServings)}
                className="text-sm text-indigo-600 hover:text-indigo-800 underline"
              >
                Réinitialiser ({defaultServings})
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section Ingrédients */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ingrédients</h2>
          <ul className="list-disc list-inside space-y-2 text-lg marker:text-indigo-600">
            {adjustedIngredients.map((ing, idx) => (
              <li key={idx} className="text-gray-700">
                <span className="font-semibold text-gray-900 capitalize">
                  {ing.name}
                </span>
                {" : "}
                <span className="text-gray-700">
                  {formatQuantity(ing.quantity)} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
