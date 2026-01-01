import { getShoppingListById } from "../planning/actions";
import ShoppingListClient from "./ShoppingListClient";
import GenerateButton from "./GenerateButton";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ShoppingListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const id = params.id ? parseInt(params.id as string) : null;

  // Si pas d'ID, afficher le bouton de génération
  if (!id) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Liste de courses</h1>
        <div className="flex justify-center">
          <GenerateButton />
        </div>
      </main>
    );
  }

  const result = await getShoppingListById(id);

  if (!result.success || !result.data) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold mb-4">Liste de courses</h1>
        <p className="text-red-600">Erreur: {result.error}</p>
      </main>
    );
  }

  return <ShoppingListClient shoppingList={result.data} />;
}
