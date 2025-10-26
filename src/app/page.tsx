export default function Home() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Recettes de la maison</h1>
      <ul className="list-disc pl-5">
        <li><a className="underline" href="/recipes">Recettes</a></li>
        <li><a className="underline" href="/planning">Planning (4 semaines)</a></li>
        <li><a className="underline" href="/shopping-list">Liste de courses</a></li>
      </ul>
    </main>
  );
}
