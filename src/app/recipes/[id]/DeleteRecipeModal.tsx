"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { deleteRecipe, forceDeleteRecipe } from "./actions";

type AffectedPlan = {
  date: string;
  slot: string;
};

export default function DeleteRecipeModal({
  recipeId,
  recipeTitle,
}: {
  recipeId: number;
  recipeTitle: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [affectedPlans, setAffectedPlans] = useState<AffectedPlan[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteRecipe(recipeId);

    if (result.success) {
      // Suppression réussie - rediriger vers la liste
      router.push("/recipes");
    } else if (result.affectedPlans) {
      // Recette utilisée dans des plannings - afficher confirmation
      setAffectedPlans(result.affectedPlans);
      setShowConfirmation(true);
      setIsDeleting(false);
    } else {
      // Erreur
      alert(`Erreur : ${result.error}`);
      setIsDeleting(false);
    }
  };

  const handleForceDelete = async () => {
    setIsDeleting(true);
    const result = await forceDeleteRecipe(recipeId);

    if (result.success) {
      router.push("/recipes");
    } else {
      alert(`Erreur : ${result.error}`);
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setShowConfirmation(false);
    setAffectedPlans([]);
  };

  return (
    <>
      <Button
        variant="danger"
        size="lg"
        fullWidth
        onClick={() => setIsOpen(true)}
      >
        <span className="mr-2">🗑️</span>
        Supprimer
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1c2128] rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            {!showConfirmation ? (
              <>
                {/* Modal de suppression initiale */}
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">⚠️</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3] mb-2">
                    Supprimer cette recette ?
                  </h2>
                  <p className="text-gray-600 dark:text-[#8b949e]">
                    Voulez-vous supprimer définitivement la recette{" "}
                    <strong>&quot;{recipeTitle}&quot;</strong> ?
                  </p>
                  <p className="text-sm text-gray-500 dark:text-[#7d8590] mt-2">
                    Cette action est irréversible.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    fullWidth
                    disabled={isDeleting}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="danger"
                    fullWidth
                    isLoading={isDeleting}
                  >
                    Supprimer
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Modal de confirmation avec plannings affectés */}
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">📅</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3] mb-2">
                    Recette utilisée dans des plannings
                  </h2>
                  <p className="text-gray-600 dark:text-[#8b949e] mb-4">
                    Cette recette est utilisée dans <strong>{affectedPlans.length}</strong> planning(s).
                  </p>

                  {/* Liste des plannings affectés */}
                  <div className="bg-yellow-50 dark:bg-[#30363d] border border-yellow-200 dark:border-[#484f59] rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
                    <ul className="text-left text-sm text-gray-700 dark:text-[#8b949e] space-y-2">
                      {affectedPlans.map((plan, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span>📌</span>
                          <span>
                            {new Date(plan.date).toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}{" "}
                            - {plan.slot === "midi" ? "🌞 Midi" : "🌙 Soir"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Supprimer cette recette retirera tous ces plannings.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    fullWidth
                    disabled={isDeleting}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleForceDelete}
                    variant="danger"
                    fullWidth
                    isLoading={isDeleting}
                  >
                    Confirmer la suppression
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
