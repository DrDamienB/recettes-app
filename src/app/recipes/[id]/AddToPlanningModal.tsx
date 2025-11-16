"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

type AddToPlanningModalProps = {
  recipeId: number;
  recipeTitle: string;
  servingsDefault: number;
};

export default function AddToPlanningModal({ recipeId, recipeTitle, servingsDefault }: AddToPlanningModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(() => {
    // Default to today
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [slot, setSlot] = useState<"midi" | "soir">("soir");
  const [peopleCount, setPeopleCount] = useState(servingsDefault);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/planning/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          slot,
          recipeId,
          peopleCount,
        }),
      });

      if (response.ok) {
        setIsOpen(false);
        router.push("/planning");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message || "Impossible d'ajouter au planning"}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout au planning:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        className="flex-1"
        onClick={() => setIsOpen(true)}
      >
        <span className="mr-2">📅</span>
        Ajouter au planning
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ajouter au planning
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Recette : <span className="font-semibold">{recipeTitle}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full h-12 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Slot */}
              <div>
                <label htmlFor="slot" className="block text-sm font-medium text-gray-700 mb-1">
                  Repas
                </label>
                <select
                  id="slot"
                  value={slot}
                  onChange={(e) => setSlot(e.target.value as "midi" | "soir")}
                  required
                  className="w-full h-12 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="midi">🌞 Midi</option>
                  <option value="soir">🌙 Soir</option>
                </select>
              </div>

              {/* People Count */}
              <div>
                <label htmlFor="peopleCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de personnes
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                    className="w-10 h-10 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors font-bold text-indigo-600"
                    aria-label="Diminuer"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    id="peopleCount"
                    min="1"
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                    className="flex-1 text-center text-lg font-bold px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setPeopleCount(peopleCount + 1)}
                    className="w-10 h-10 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors font-bold text-indigo-600"
                    aria-label="Augmenter"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? "Ajout en cours..." : "Ajouter"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
