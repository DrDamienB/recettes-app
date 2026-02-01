export type FreezerItem = {
  id: number;
  title: string;
  type: "entree" | "plat" | "dessert" | "aliment_brut" | "plat_prepare";
  quantity: number;
  expirationDate: string;
  drawerId: number;
  createdAt: string;
  updatedAt: string;
};

export type Drawer = {
  id: number;
  name: string;
  order: number;
  freezerId: number;
  items: FreezerItem[];
};

export type Freezer = {
  id: number;
  name: string;
  order: number;
  drawers: Drawer[];
  createdAt: string;
};

export const ITEM_TYPES = [
  { value: "entree", label: "Entrée", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { value: "plat", label: "Plat", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  { value: "dessert", label: "Dessert", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
  { value: "aliment_brut", label: "Aliment brut", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  { value: "plat_prepare", label: "Plat préparé", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
] as const;

export function getTypeInfo(type: string) {
  return ITEM_TYPES.find((t) => t.value === type) || ITEM_TYPES[0];
}

export function getExpirationStatus(date: string) {
  const now = new Date();
  const exp = new Date(date);
  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Expiré", class: "text-red-600 dark:text-red-400", urgent: true };
  if (diffDays <= 15) return { label: `${diffDays}j`, class: "text-red-600 dark:text-red-400", urgent: true };
  if (diffDays <= 30) return { label: `${diffDays}j`, class: "text-orange-600 dark:text-orange-400", urgent: false };
  return { label: `${diffDays}j`, class: "text-green-600 dark:text-green-400", urgent: false };
}
