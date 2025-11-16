"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type BreadcrumbItem = {
  label: string;
  href: string;
};

export default function Breadcrumb() {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split("/").filter((p) => p);
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Accueil", href: "/" }];

    const pathMapping: Record<string, string> = {
      recipes: "Recettes",
      planning: "Planning",
      "shopping-list": "Liste de courses",
      new: "Nouvelle recette",
      import: "Importer une recette",
      edit: "Modifier",
    };

    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;

      // Si c'est un nombre (ID), on ne l'ajoute pas au breadcrumb
      if (/^\d+$/.test(path)) {
        return;
      }

      const label = pathMapping[path] || path.charAt(0).toUpperCase() + path.slice(1);
      breadcrumbs.push({ label, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Ne pas afficher si on est sur la page d'accueil
  if (pathname === "/") {
    return null;
  }

  return (
    <nav aria-label="Fil d'ariane" className="mb-4">
      <ol className="flex items-center gap-2 text-sm text-gray-600">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={crumb.href} className="flex items-center gap-2">
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {isLast ? (
                <span className="font-medium text-gray-900" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-indigo-600 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
