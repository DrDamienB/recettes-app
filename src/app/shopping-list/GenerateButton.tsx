"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { generateShoppingList } from "../planning/actions";

type GenerateButtonProps = {
  autoRedirect?: boolean;
};

export default function GenerateButton({ autoRedirect = false }: GenerateButtonProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const hasGeneratedRef = useRef(false);

  // Auto-génération au montage si autoRedirect est activé (une seule fois)
  useEffect(() => {
    if (!autoRedirect || hasGeneratedRef.current) return;

    hasGeneratedRef.current = true;

    const generate = async () => {
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

    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (autoRedirect && isGenerating) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-lg text-gray-700 font-medium">Génération de la liste de courses...</p>
        </div>
      </div>
    );
  }

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
