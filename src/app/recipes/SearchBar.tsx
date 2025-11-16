"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";

type SearchBarProps = {
  initialQuery: string;
};

export default function SearchBar({ initialQuery }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSearch = (value: string) => {
    setQuery(value);

    startTransition(() => {
      if (value.trim()) {
        router.push(`/recipes?q=${encodeURIComponent(value.trim())}`);
      } else {
        router.push("/recipes");
      }
    });
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Rechercher une recette par titre ou description..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        fullWidth
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg
            className="animate-spin h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
    </div>
  );
}
