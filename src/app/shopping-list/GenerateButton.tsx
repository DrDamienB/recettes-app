"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateShoppingList } from "../planning/actions";

export default function GenerateButton() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const result = await generateShoppingList(startDate, endDate);
    setIsGenerating(false);

    if (result.success && result.shoppingListId) {
      router.push(`/shopping-list?id=${result.shoppingListId}`);
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
      className={`px-6 py-3 rounded text-white font-medium ${
        isGenerating
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {isGenerating ? "Génération..." : "📋 Générer pour les 7 prochains jours"}
    </button>
  );
}
