"use client";
import { useState } from "react";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui";

type Row = {
  name: string;
  qtyPerPerson: string;
  unitCode: "g" | "kg" | "mL" | "L" | "piece" | "cac" | "cas";
  storeSection: string;
  storeName: string;
};

type IngredientRowsProps = {
  defaultIngredients?: Array<{
    name: string;
    qtyPerPerson: number;
    unitCode: string;
    storeSection?: string;
    storeName?: string;
  }>;
};

const STORE_SECTIONS = [
  "primeur",
  "crèmerie",
  "boulangerie",
  "boucherie/poissonnerie",
  "conserves/épicerie salée",
  "sucré",
  "surgelés",
  "boissons",
  "entretien",
  "épicerie salée",
];

const STORES = [
  "Auchan",
  "Carrefour",
  "Leclerc",
  "Intermarché",
  "Super U",
  "Lidl",
  "Aldi",
  "Autre",
];

export default function IngredientRows({ defaultIngredients }: IngredientRowsProps = {}) {
  const initialRows: Row[] = defaultIngredients && defaultIngredients.length > 0
    ? defaultIngredients.map(ing => ({
        name: ing.name,
        qtyPerPerson: String(ing.qtyPerPerson),
        unitCode: ing.unitCode as Row["unitCode"],
        storeSection: ing.storeSection || "épicerie salée",
        storeName: ing.storeName || "Auchan",
      }))
    : [{ name: "", qtyPerPerson: "", unitCode: "g", storeSection: "épicerie salée", storeName: "Auchan" }];

  const [rows, setRows] = useState<Row[]>(initialRows);

  function addRow() {
    setRows(r => [...r, { name: "", qtyPerPerson: "", unitCode: "g", storeSection: "épicerie salée", storeName: "Auchan" }]);
  }
  function removeRow(i: number) {
    setRows(r => r.filter((_, idx) => idx !== i));
  }
  function updateRow(i: number, key: keyof Row, value: string) {
    setRows(r => {
      const copy = [...r];
      (copy[i] as any)[key] = value;
      return copy;
    });
  }

  // on encode en JSON pour l'action serveur
  const payload = JSON.stringify(
    rows
      .filter(r => r.name.trim())
      .map(r => ({
        name: r.name,
        qtyPerPerson: Number(r.qtyPerPerson || 0),
        unitCode: r.unitCode,
        storeSection: r.storeSection,
        storeName: r.storeName,
      }))
  );

  return (
    <div className="space-y-3">
      <input type="hidden" name="ingredients" value={payload} />
      {rows.map((r, i) => (
        <Card key={i} padding="md">
          <div className="space-y-3">
            {/* Ligne 1: Nom et quantité */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-[#e6edf3] mb-1.5">
                  Ingrédient
                </label>
                <input
                  className="w-full h-11 px-3 py-2 bg-white dark:bg-[#0f1419] border border-gray-300 dark:border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-[#e6edf3] placeholder-gray-400 dark:placeholder-[#8b949e]"
                  value={r.name}
                  placeholder="Ex: Tomates"
                  onChange={e => updateRow(i, "name", e.target.value)}
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-[#e6edf3] mb-1.5">
                  Qté / pers.
                </label>
                <input
                  className="w-full h-11 px-3 py-2 bg-white dark:bg-[#0f1419] border border-gray-300 dark:border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-[#e6edf3] placeholder-gray-400 dark:placeholder-[#8b949e]"
                  type="number"
                  step="0.01"
                  placeholder="150"
                  value={r.qtyPerPerson}
                  onChange={e => updateRow(i, "qtyPerPerson", e.target.value)}
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-[#e6edf3] mb-1.5">
                  Unité
                </label>
                <select
                  className="w-full h-11 px-3 py-2 bg-white dark:bg-[#0f1419] border border-gray-300 dark:border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-[#e6edf3] cursor-pointer"
                  value={r.unitCode}
                  onChange={e => updateRow(i, "unitCode", e.target.value)}
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="mL">mL</option>
                  <option value="L">L</option>
                  <option value="piece">pièce</option>
                  <option value="cac">c.à.c</option>
                  <option value="cas">c.à.s</option>
                </select>
              </div>
            </div>

            {/* Ligne 2: Rayon et magasin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#e6edf3] mb-1.5">
                  Rayon
                </label>
                <select
                  className="w-full h-11 px-3 py-2 bg-white dark:bg-[#0f1419] border border-gray-300 dark:border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-[#e6edf3] cursor-pointer"
                  value={r.storeSection}
                  onChange={e => updateRow(i, "storeSection", e.target.value)}
                >
                  {STORE_SECTIONS.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#e6edf3] mb-1.5">
                  Magasin
                </label>
                <select
                  className="w-full h-11 px-3 py-2 bg-white dark:bg-[#0f1419] border border-gray-300 dark:border-[#30363d] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-[#e6edf3] cursor-pointer"
                  value={r.storeName}
                  onChange={e => updateRow(i, "storeName", e.target.value)}
                >
                  {STORES.map(store => (
                    <option key={store} value={store}>{store}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bouton supprimer */}
            <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-[#30363d]">
              <Button
                type="button"
                onClick={() => removeRow(i)}
                variant="danger"
                size="sm"
              >
                <span className="mr-1.5">🗑️</span>
                Supprimer
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <Button
        type="button"
        onClick={addRow}
        variant="secondary"
        size="md"
        fullWidth
      >
        <span className="mr-2">➕</span>
        Ajouter un ingrédient
      </Button>
    </div>
  );
}
