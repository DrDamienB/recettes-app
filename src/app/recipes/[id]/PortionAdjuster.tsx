"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";

type Ingredient = {
  id: number;
  qtyPerPerson: number;
  unitCode: string;
  Ingredient: {
    id: number;
    nameNormalized: string;
    storeSection: string | null;
  };
  Unit: {
    code: string;
    name: string;
  } | null;
};

type PortionAdjusterProps = {
  defaultServings: number;
  ingredientsBySection: Record<string, Ingredient[]>;
  sectionColors: Record<string, string>;
};

export default function PortionAdjuster({
  defaultServings,
  ingredientsBySection,
  sectionColors,
}: PortionAdjusterProps) {
  const [servings, setServings] = useState(defaultServings);

  const formatQuantity = (qtyPerPerson: number, servings: number, unitCode: string) => {
    const total = qtyPerPerson * servings;

    // Format with appropriate decimal places
    if (total === 0) return "—";
    if (total < 1) return total.toFixed(2);
    if (total < 10) return total.toFixed(1);
    return Math.round(total).toString();
  };

  return (
    <>
      {/* Portion Adjuster */}
      <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <div className="flex items-center gap-4">
          <label htmlFor="servings" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Nombre de personnes :
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="w-10 h-10 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors font-bold text-indigo-600"
              aria-label="Diminuer les portions"
            >
              −
            </button>
            <input
              id="servings"
              type="number"
              min="1"
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center text-lg font-bold px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setServings(servings + 1)}
              className="w-10 h-10 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors font-bold text-indigo-600"
              aria-label="Augmenter les portions"
            >
              +
            </button>
          </div>
          {servings !== defaultServings && (
            <button
              type="button"
              onClick={() => setServings(defaultServings)}
              className="ml-auto text-sm text-indigo-600 hover:text-indigo-800 underline"
            >
              Réinitialiser ({defaultServings})
            </button>
          )}
        </div>
      </div>

      {/* Ingredients by Section */}
      <div className="space-y-6">
        {Object.entries(ingredientsBySection).map(([section, ingredients]) => (
          <div key={section}>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
              {section}
            </h3>
            <div
              className={`rounded-lg border p-4 ${
                sectionColors[section] || "bg-gray-50 border-gray-200"
              }`}
            >
              <ul className="space-y-3">
                {ingredients.map((ing) => {
                  const quantity = formatQuantity(ing.qtyPerPerson, servings, ing.unitCode);
                  const unit = ing.Unit?.name || ing.unitCode;

                  return (
                    <li key={ing.id} className="flex items-baseline gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0"></span>
                      <span className="font-semibold text-gray-900 min-w-[60px] text-right">
                        {quantity}
                      </span>
                      <span className="text-gray-600 min-w-[80px]">{unit}</span>
                      <span className="text-gray-800 flex-1">{ing.Ingredient.nameNormalized}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
