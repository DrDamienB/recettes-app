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

  if (!id) {
    return (
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Liste de courses</h1>
        <p className="text-gray-600 mb-6">
          Aucune liste générée. Vous pouvez générer automatiquement une liste
          pour les 7 prochains jours ou allez sur la page{" "}
          <a href="/planning" className="underline text-blue-600">
            Planning
          </a>{" "}
          pour personnaliser vos repas.
        </p>
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
