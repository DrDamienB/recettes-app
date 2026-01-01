"use client";
import { useState } from "react";

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
        <div key={i} className="space-y-2 border-b pb-4">
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-6">
              <label className="block text-sm">Ingrédient</label>
              <input className="border rounded h-11 p-2.5 w-full"
                value={r.name}
                onChange={e => updateRow(i, "name", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm">Qté / pers.</label>
              <input className="border rounded h-11 p-2.5 w-full" type="number" step="0.01"
                value={r.qtyPerPerson}
                onChange={e => updateRow(i, "qtyPerPerson", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm">Unité</label>
              <select className="border rounded h-11 p-2.5 w-full"
                value={r.unitCode}
                onChange={e => updateRow(i, "unitCode", e.target.value)}>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="mL">mL</option>
                <option value="L">L</option>
                <option value="piece">pièce</option>
                <option value="cac">c.à.c</option>
                <option value="cas">c.à.s</option>
              </select>
            </div>
            <div className="col-span-2">
              <button type="button" onClick={() => removeRow(i)} className="text-sm underline opacity-70 text-red-600">
                Supprimer
              </button>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-6">
              <label className="block text-sm">Magasin</label>
              <select className="border rounded h-11 p-2.5 w-full"
                value={r.storeName}
                onChange={e => updateRow(i, "storeName", e.target.value)}>
                <option value="Fresh">Fresh</option>
                <option value="Asiatique">Asiatique</option>
                <option value="Primeur">Primeur</option>
                <option value="Auchan">Auchan</option>
                <option value="Carrefour">Carrefour</option>
                <option value="Leclerc">Leclerc</option>
                <option value="Placard">Placard</option>
              </select>
            </div>
            <div className="col-span-6">
              <label className="block text-sm">Rayon</label>
              <select className="border rounded h-11 p-2.5 w-full"
                value={r.storeSection}
                onChange={e => updateRow(i, "storeSection", e.target.value)}>
                <option>primeur</option>
                <option>crèmerie</option>
                <option>boulangerie</option>
                <option>boucherie/poissonnerie</option>
                <option>conserves/épicerie salée</option>
                <option>sucré</option>
                <option>surgelés</option>
                <option>boissons</option>
                <option>entretien</option>
                <option>épicerie salée</option>
              </select>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addRow} className="border rounded px-3 py-2">
        + Ajouter un ingrédient
      </button>
    </div>
  );
}
