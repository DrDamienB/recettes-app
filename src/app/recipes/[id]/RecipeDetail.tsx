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
    code: string;
    singularForm: string | null;
    pluralForm: string | null;
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

function formatUnit(
  unitCode: string,
  quantity: number,
  unitData: { singularForm: string | null; pluralForm: string | null } | null
): string {
  // Si on a les formes dans la BDD, les utiliser
  if (unitData) {
    if (quantity > 1 && unitData.pluralForm) {
      return unitData.pluralForm;
    }
    if (unitData.singularForm) {
      return unitData.singularForm;
    }
  }

  // Sinon, fallback sur le code de l'unité
  return unitCode;
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
    unit: ing.Unit?.code || ing.unitCode,
    unitData: ing.Unit
      ? { singularForm: ing.Unit.singularForm, pluralForm: ing.Unit.pluralForm }
      : null,
  }));

  return (
    <>
      {/* Section Temps */}
      {(prepMin || cookMin) && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3] mb-4 hidden sm:block">⏱️ Temps de préparation</h2>

            {/* Version mobile : ligne compacte */}
            <div className="sm:hidden flex items-center gap-4 text-sm">
            {prepMin && (
              <span className="flex items-center gap-1">
                <span>⏱️</span>
                <span className="text-gray-600 dark:text-[#8b949e]">Prép:</span>
                <span className="font-medium text-gray-900 dark:text-[#e6edf3]">{prepMin}min</span>
              </span>
            )}
            {cookMin && (
              <>
                <span className="text-gray-400 dark:text-[#484f59]">|</span>
                <span className="flex items-center gap-1">
                  <span>🔥</span>
                  <span className="text-gray-600 dark:text-[#8b949e]">Cuiss:</span>
                  <span className="font-medium text-gray-900 dark:text-[#e6edf3]">{cookMin}min</span>
                </span>
              </>
            )}
            {totalMin > 0 && (
              <>
                <span className="text-gray-400 dark:text-[#484f59]">|</span>
                <span className="flex items-center gap-1">
                  <span>⏲️</span>
                  <span className="text-gray-600 dark:text-[#8b949e]">Total:</span>
                  <span className="font-medium text-gray-900 dark:text-[#e6edf3]">{totalMin}min</span>
                </span>
              </>
            )}
          </div>

          {/* Version desktop : cartes */}
          <div className="hidden sm:grid grid-cols-3 gap-4">
            {/* Préparation */}
            <div className="bg-blue-50 dark:bg-[#1c2128] rounded-lg p-4 text-center border border-blue-200 dark:border-[#30363d] shadow-sm">
              <div className="text-3xl mb-2">⏰</div>
              <div className="text-sm text-gray-600 dark:text-[#8b949e] mb-1">Préparation</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3]">
                {prepMin ? `${prepMin} min` : "—"}
              </div>
            </div>

            {/* Cuisson */}
            <div className="bg-orange-50 dark:bg-[#1c2128] rounded-lg p-4 text-center border border-orange-200 dark:border-[#30363d] shadow-sm">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-sm text-gray-600 dark:text-[#8b949e] mb-1">Cuisson</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3]">
                {cookMin ? `${cookMin} min` : "—"}
              </div>
            </div>

            {/* Total */}
            <div className="bg-green-50 dark:bg-[#1c2128] rounded-lg p-4 text-center border border-green-200 dark:border-[#30363d] shadow-sm">
              <div className="text-3xl mb-2">⏲️</div>
              <div className="text-sm text-gray-600 dark:text-[#8b949e] mb-1">Total</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3]">
                {totalMin > 0 ? `${totalMin} min` : "—"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Section Nombre de personnes */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-[#e6edf3]">👥 Nombre de personnes</h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-[#1c2128] border-2 border-gray-300 dark:border-[#30363d] rounded-lg hover:bg-gray-100 dark:hover:bg-[#30363d] transition-colors font-bold text-gray-700 dark:text-[#e6edf3] flex items-center justify-center text-xl"
                aria-label="Diminuer le nombre de personnes"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 sm:w-20 h-10 sm:h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#1c2128] text-gray-900 dark:text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setServings(servings + 1)}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-[#1c2128] border-2 border-gray-300 dark:border-[#30363d] rounded-lg hover:bg-gray-100 dark:hover:bg-[#30363d] transition-colors font-bold text-gray-700 dark:text-[#e6edf3] flex items-center justify-center text-xl"
                aria-label="Augmenter le nombre de personnes"
              >
                +
              </button>
            </div>
            {servings !== defaultServings && (
              <button
                type="button"
                onClick={() => setServings(defaultServings)}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3] mb-4">🥕 Ingrédients</h2>
          <ul className="list-disc list-inside space-y-2 text-base marker:text-indigo-600 dark:marker:text-indigo-400">
            {adjustedIngredients.map((ing, idx) => (
              <li key={idx} className="text-gray-700 dark:text-[#8b949e]">
                <span className="font-semibold text-gray-900 dark:text-[#e6edf3] capitalize">
                  {ing.name}
                </span>
                {" : "}
                <span className="text-gray-700 dark:text-[#8b949e]">
                  {formatQuantity(ing.quantity)} {formatUnit(ing.unit, ing.quantity, ing.unitData)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
