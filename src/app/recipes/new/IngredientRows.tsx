"use client";
import { useState } from "react";

type Row = {
  name: string;
  qtyPerPerson: string;
  unitCode: "g" | "kg" | "mL" | "L" | "piece" | "cac" | "cas";
  storeSection: string;
};

export default function IngredientRows() {
  const [rows, setRows] = useState<Row[]>([
    { name: "", qtyPerPerson: "", unitCode: "g", storeSection: "épicerie salée" },
  ]);

  function addRow() {
    setRows(r => [...r, { name: "", qtyPerPerson: "", unitCode: "g", storeSection: "épicerie salée" }]);
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

  // on encode en JSON pour l’action serveur
  const payload = JSON.stringify(
    rows
      .filter(r => r.name.trim())
      .map(r => ({
        name: r.name,
        qtyPerPerson: Number(r.qtyPerPerson || 0),
        unitCode: r.unitCode,
        storeSection: r.storeSection,
      }))
  );

  return (
    <div className="space-y-3">
      <input type="hidden" name="ingredients" value={payload} />
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-5">
            <label className="block text-sm">Ingrédient</label>
            <input className="border rounded p-2 w-full"
              value={r.name}
              onChange={e => updateRow(i, "name", e.target.value)} />
          </div>
          <div className="col-span-3">
            <label className="block text-sm">Qté / personne</label>
            <input className="border rounded p-2 w-full" type="number" step="0.01"
              value={r.qtyPerPerson}
              onChange={e => updateRow(i, "qtyPerPerson", e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm">Unité</label>
            <select className="border rounded p-2 w-full"
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
            <label className="block text-sm">Rayon</label>
            <select className="border rounded p-2 w-full"
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
          <div className="col-span-12">
            <button type="button" onClick={() => removeRow(i)} className="text-sm underline opacity-70">
              Supprimer
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addRow} className="border rounded px-3 py-2">
        + Ajouter un ingrédient
      </button>
    </div>
  );
}
