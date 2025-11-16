import { getMealPlans, getRecipesForDropdown } from "./actions";
import PlanningCalendar from "./PlanningCalendar";

type PlanningPageProps = {
  searchParams: Promise<{ view?: string; week?: string }>;
};

export default async function PlanningPage({ searchParams }: PlanningPageProps) {
  const params = await searchParams;
  const view = params.view || "4"; // 4 semaines par défaut
  const weekOffset = parseInt(params.week || "0", 10);

  const weeksToShow = parseInt(view, 10);
  const daysToShow = weeksToShow * 7;

  // Calculer la période en fonction de l'offset
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() + weekOffset * 7);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + daysToShow - 1);
  endDate.setHours(23, 59, 59, 999);

  // Récupérer les données
  const [mealPlans, recipes] = await Promise.all([
    getMealPlans(startDate, endDate),
    getRecipesForDropdown(),
  ]);

  return (
    <main>
      <PlanningCalendar
        startDate={startDate}
        endDate={endDate}
        mealPlans={mealPlans}
        recipes={recipes}
        view={view}
        weekOffset={weekOffset}
      />
    </main>
  );
}
