"use client";

import { useState } from "react";
import { assignRecipeToSlot, removeRecipeFromSlot, updatePeopleCount, generateShoppingList } from "./actions";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";
import RecipePickerModal from "./RecipePickerModal";

type Recipe = {
  id: number;
  title: string;
  slug: string;
};

type MealPlanItem = {
  id: number;
  recipeId: number;
  Recipe: Recipe;
};

type MealPlan = {
  id: number;
  date: Date;
  slot: string;
  peopleCount: number;
  items: MealPlanItem[];
};

type Props = {
  startDate: Date;
  endDate: Date;
  mealPlans: MealPlan[];
  recipes: Recipe[];
  view: string;
  weekOffset: number;
};

export default function PlanningCalendar({ startDate, endDate, mealPlans, recipes, view, weekOffset }: Props) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  // Générer les jours
  const days: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Grouper par semaine
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const findMealPlan = (date: Date, slot: "midi" | "soir"): MealPlan | undefined => {
    return mealPlans.find(
      (mp) =>
        new Date(mp.date).toDateString() === date.toDateString() &&
        mp.slot === slot
    );
  };

  const handleAssignRecipe = async (
    date: Date,
    slot: "midi" | "soir",
    recipeId: string,
    peopleCount: number
  ) => {
    if (!recipeId) {
      await removeRecipeFromSlot(date, slot);
    } else {
      await assignRecipeToSlot(date, slot, parseInt(recipeId), peopleCount);
    }
    router.refresh();
  };

  const handleUpdatePeople = async (
    date: Date,
    slot: "midi" | "soir",
    peopleCount: number
  ) => {
    await updatePeopleCount(date, slot, peopleCount);
    router.refresh();
  };

  const handleGenerateShoppingList = async () => {
    setIsGenerating(true);
    const result = await generateShoppingList(startDate, endDate);
    setIsGenerating(false);

    if (result.success && result.shoppingListId) {
      router.push(`/shopping-list?id=${result.shoppingListId}`);
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  const buildUrl = (newView?: string, newOffset?: number) => {
    const params = new URLSearchParams();
    if (newView && newView !== "4") params.set("view", newView);
    if (newOffset && newOffset !== 0) params.set("week", newOffset.toString());
    const query = params.toString();
    return `/planning${query ? `?${query}` : ""}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-16 z-40 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Title and View Selector */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Planning des repas</h1>
              <p className="text-sm text-gray-600 mt-1">
                Du {startDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} au{" "}
                {endDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            {/* View Selector */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <a href={buildUrl("1", weekOffset)}>
                <Button
                  variant={view === "1" ? "primary" : "secondary"}
                  size="sm"
                  className={view !== "1" ? "bg-transparent hover:bg-white" : ""}
                >
                  1 sem
                </Button>
              </a>
              <a href={buildUrl("2", weekOffset)}>
                <Button
                  variant={view === "2" ? "primary" : "secondary"}
                  size="sm"
                  className={view !== "2" ? "bg-transparent hover:bg-white" : ""}
                >
                  2 sem
                </Button>
              </a>
              <a href={buildUrl("4", weekOffset)}>
                <Button
                  variant={view === "4" ? "primary" : "secondary"}
                  size="sm"
                  className={view !== "4" ? "bg-transparent hover:bg-white" : ""}
                >
                  4 sem
                </Button>
              </a>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex gap-2 flex-1">
              <a href={buildUrl(view, weekOffset - 1)} className="flex-1 sm:flex-initial">
                <Button variant="secondary" size="md" fullWidth>
                  ← Précédent
                </Button>
              </a>
              <a href={buildUrl(view, 0)} className="flex-1 sm:flex-initial">
                <Button variant="secondary" size="md" fullWidth>
                  📅 Aujourd'hui
                </Button>
              </a>
              <a href={buildUrl(view, weekOffset + 1)} className="flex-1 sm:flex-initial">
                <Button variant="secondary" size="md" fullWidth>
                  Suivant →
                </Button>
              </a>
            </div>

            <Button
              onClick={handleGenerateShoppingList}
              isLoading={isGenerating}
              size="md"
              variant="primary"
              className="flex items-center gap-2 sm:w-auto"
            >
              <span>🛒</span>
              <span className="hidden sm:inline">Générer la liste de courses</span>
              <span className="sm:hidden">Liste de courses</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-6">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {week.map((day) => {
                const dayOfWeek = day.toLocaleDateString("fr-FR", { weekday: "long" });
                const dateStr = day.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
                const midiPlan = findMealPlan(day, "midi");
                const soirPlan = findMealPlan(day, "soir");

                return (
                  <Card
                    key={day.toISOString()}
                    className={`${isToday(day) ? "ring-2 ring-indigo-500" : ""} ${
                      isPast(day) ? "opacity-60" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* Day Header */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-900 capitalize">{dayOfWeek}</h3>
                          {isToday(day) && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                              Aujourd'hui
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{dateStr}</p>
                      </div>

                      {/* Meal Slots */}
                      <div className="space-y-4">
                        {/* Midi */}
                        <MealSlot
                          label="🌞 Midi"
                          day={day}
                          slot="midi"
                          mealPlan={midiPlan}
                          recipes={recipes}
                          onAssignRecipe={handleAssignRecipe}
                          onUpdatePeople={handleUpdatePeople}
                        />

                        {/* Soir */}
                        <MealSlot
                          label="🌙 Soir"
                          day={day}
                          slot="soir"
                          mealPlan={soirPlan}
                          recipes={recipes}
                          onAssignRecipe={handleAssignRecipe}
                          onUpdatePeople={handleUpdatePeople}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Meal Slot Component
function MealSlot({
  label,
  day,
  slot,
  mealPlan,
  recipes,
  onAssignRecipe,
  onUpdatePeople,
}: {
  label: string;
  day: Date;
  slot: "midi" | "soir";
  mealPlan: MealPlan | undefined;
  recipes: Recipe[];
  onAssignRecipe: (date: Date, slot: "midi" | "soir", recipeId: string, peopleCount: number) => void;
  onUpdatePeople: (date: Date, slot: "midi" | "soir", peopleCount: number) => void;
}) {
  const selectedRecipe = mealPlan?.items[0]?.Recipe;
  const peopleCount = mealPlan?.peopleCount || 2;

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>

      <RecipePickerModal
        recipes={recipes}
        selectedRecipeId={selectedRecipe?.id || null}
        onSelect={(recipeId) => {
          if (recipeId === null) {
            onAssignRecipe(day, slot, "", peopleCount);
          } else {
            onAssignRecipe(day, slot, String(recipeId), peopleCount);
          }
        }}
        label={label}
        slot={slot}
      />

      {selectedRecipe && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-600">👥</span>
          <input
            type="number"
            min="1"
            value={peopleCount}
            onChange={(e) => onUpdatePeople(day, slot, parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-xs text-gray-600">pers.</span>
        </div>
      )}
    </div>
  );
}
