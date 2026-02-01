"use client";

import { useEffect, useState } from "react";
import FreezerClient from "./FreezerClient";

export default function FreezerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/freezers")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🧊</div>
          <p className="text-gray-600 dark:text-[#8b949e]">Chargement...</p>
        </div>
      </main>
    );
  }

  return <FreezerClient initialData={data || []} />;
}
