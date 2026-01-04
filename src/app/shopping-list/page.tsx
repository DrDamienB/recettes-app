"use client";

import { useEffect, useState } from "react";
import { getDynamicShoppingList } from "./actions";
import DynamicShoppingListClient from "./DynamicShoppingListClient";

export default function ShoppingListPage() {
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);

      const data = await getDynamicShoppingList(today, endDate);
      setInitialData(data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🛒</div>
          <p className="text-gray-600 dark:text-[#8b949e]">Chargement...</p>
        </div>
      </main>
    );
  }

  if (!initialData) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-3">❌</div>
          <p className="text-gray-600 dark:text-[#8b949e]">Erreur de chargement</p>
        </div>
      </main>
    );
  }

  return <DynamicShoppingListClient initialData={initialData} />;
}
