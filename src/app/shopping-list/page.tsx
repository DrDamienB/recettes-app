import { getDynamicShoppingList } from "./actions";
import DynamicShoppingListClient from "./DynamicShoppingListClient";

// Force dynamic rendering (évite le prerender au build time)
export const dynamic = 'force-dynamic';

export default async function ShoppingListPage() {
  // Calculer la liste de courses pour les 7 prochains jours
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 7);

  const shoppingData = await getDynamicShoppingList(today, endDate);

  return <DynamicShoppingListClient initialData={shoppingData} />;
}
