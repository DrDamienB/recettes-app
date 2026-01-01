"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks: Array<{ href: string; label: string; icon: string; highlight?: boolean }> = [
    { href: "/recipes", label: "Recettes", icon: "📖" },
    { href: "/planning", label: "Planning", icon: "📅" },
    { href: "/shopping-list", label: "Liste de courses", icon: "🛒" },
  ];

  const isActive = (href: string) => {
    if (href === "/recipes") {
      return pathname === "/recipes" || pathname.startsWith("/recipes/");
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-indigo-600 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/recipes"
            className="flex items-center gap-2 text-white font-semibold text-xl hover:text-indigo-100 transition-colors"
          >
            <span className="text-2xl">🍳</span>
            <span className="hidden sm:inline">Recettes Maison</span>
            <span className="sm:hidden">Recettes</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all duration-200
                  flex items-center gap-2
                  ${
                    link.highlight
                      ? "bg-white text-indigo-600 hover:bg-indigo-50"
                      : isActive(link.href)
                      ? "bg-indigo-700 text-white"
                      : "text-indigo-100 hover:bg-indigo-500 hover:text-white"
                  }
                `}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Menu principal"
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  block px-4 py-3 rounded-lg font-medium transition-all duration-200
                  flex items-center gap-3
                  ${
                    link.highlight
                      ? "bg-white text-indigo-600"
                      : isActive(link.href)
                      ? "bg-indigo-700 text-white"
                      : "text-indigo-100 hover:bg-indigo-500 hover:text-white"
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
