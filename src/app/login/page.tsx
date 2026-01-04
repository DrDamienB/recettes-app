"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginFormState } from "./actions";
import { Button, Input } from "@/components/ui";
import { useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" isLoading={pending} fullWidth size="lg">
      {pending ? "Connexion..." : "Se connecter"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState<LoginFormState | null, FormData>(
    loginAction,
    null
  );
  const [showDeviceName, setShowDeviceName] = useState(false);

  // Si besoin d'un nom d'appareil, afficher le champ
  if (state?.needsDeviceName && !showDeviceName) {
    setShowDeviceName(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0f1419] dark:via-[#0f1419] dark:to-[#1c2128] px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e6edf3] mb-2">
            Recettes App
          </h1>
          <p className="text-gray-600 dark:text-[#8b949e]">
            Connectez-vous pour accéder à vos recettes
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white dark:bg-[#1c2128] rounded-2xl shadow-xl border border-gray-200 dark:border-[#30363d] p-8">
          {state?.error && !state.needsDeviceName && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">{state.error}</p>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <Input
              name="username"
              label="Nom d'utilisateur"
              placeholder="Bocuse"
              fullWidth
              autoComplete="username"
              autoFocus
            />

            <Input
              name="password"
              type="password"
              label="Mot de passe"
              placeholder="••••••••"
              fullWidth
              autoComplete="current-password"
            />

            {showDeviceName && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200 mb-3 font-medium">
                  Nouvel appareil détecté
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  Pour identifier cet appareil, donnez-lui un nom (ex: "iPhone de Damien", "iPad Cuisine")
                </p>
                <Input
                  name="deviceName"
                  label="Nom de l'appareil"
                  placeholder="Ex: Mon ordinateur"
                  fullWidth
                />
              </div>
            )}

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}
