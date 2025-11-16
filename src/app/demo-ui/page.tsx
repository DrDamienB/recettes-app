"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui";

export default function DemoUIPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (!email.includes("@")) {
      setEmailError("Email invalide");
      return;
    }
    setEmailError("");
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Démo Composants UI</h1>
          <p className="text-gray-600">
            Bibliothèque de composants réutilisables pour l'application
          </p>
        </div>

        {/* Section Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Différents variants, tailles et états
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-gray-700">
                  Variants
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-gray-700">
                  Tailles
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              {/* States */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-gray-700">
                  États
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Button disabled>Désactivé</Button>
                  <Button isLoading>Chargement...</Button>
                  <Button fullWidth>Pleine largeur</Button>
                </div>
              </div>

              {/* With icons */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-gray-700">
                  Avec icônes
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Button>
                    <span>📋</span>
                    Générer
                  </Button>
                  <Button variant="secondary">
                    <span>🖨️</span>
                    Imprimer
                  </Button>
                  <Button variant="danger">
                    <span>🗑️</span>
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
            <CardDescription>
              Champs de formulaire avec labels et validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-md">
              <Input label="Nom de la recette" placeholder="Ex: Crêpes sucrées" />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                required
              />

              <Input
                label="Portions"
                type="number"
                defaultValue="4"
                hint="Nombre de personnes pour cette recette"
              />

              <Input
                label="Description"
                placeholder="Décrivez votre recette..."
                fullWidth
              />

              <Input label="Champ désactivé" disabled value="Non modifiable" />

              <Button onClick={handleSubmit} isLoading={isLoading}>
                Valider le formulaire
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Cards</h2>
          <p className="text-gray-600 mb-6">
            Cartes composables pour afficher du contenu structuré
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card simple */}
            <Card hover>
              <CardHeader>
                <CardTitle>Crêpes sucrées</CardTitle>
                <CardDescription>Dessert traditionnel français</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>⏱️ 30 min</span>
                  <span>👥 4 pers.</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    dessert
                  </span>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    facile
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="sm" fullWidth>
                  Voir la recette
                </Button>
              </CardFooter>
            </Card>

            {/* Card avec image */}
            <Card padding="none" hover>
              <div className="h-40 bg-gradient-to-br from-orange-200 to-orange-400 rounded-t-lg"></div>
              <div className="p-4">
                <CardTitle>Tarte aux pommes</CardTitle>
                <CardDescription className="mt-2">
                  Un grand classique de la pâtisserie
                </CardDescription>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" fullWidth>
                    Détails
                  </Button>
                  <Button size="sm" fullWidth>
                    Cuisiner
                  </Button>
                </div>
              </div>
            </Card>

            {/* Card minimaliste */}
            <Card>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">🍝</div>
                  <CardTitle>Pâtes carbonara</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Recette italienne authentique
                  </p>
                  <Button size="sm" variant="secondary" className="mt-4">
                    Ajouter au planning
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card avec footer personnalisé */}
            <Card>
              <CardHeader>
                <CardTitle as="h4">Salade César</CardTitle>
                <CardDescription>Entrée fraîche et croquante</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Laitue romaine</li>
                  <li>✓ Poulet grillé</li>
                  <li>✓ Parmesan</li>
                  <li>✓ Croûtons</li>
                </ul>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-sm text-gray-600">15 min</span>
                <Button size="sm" variant="secondary">
                  Voir plus
                </Button>
              </CardFooter>
            </Card>

            {/* Card interactive */}
            <Card hover onClick={() => alert("Card cliquée!")}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                  🥗
                </div>
                <div className="flex-1">
                  <CardTitle as="h4">Bowl végétarien</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Healthy et coloré
                  </p>
                </div>
              </div>
            </Card>

            {/* Card avec statut */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle as="h4">Soupe de légumes</CardTitle>
                <CardDescription>
                  <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                    ✓ Disponible
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Tous les ingrédients sont en stock
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <Card>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">
                Composants créés avec React, TypeScript et Tailwind CSS
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <a href="/">
                  <Button size="sm" variant="secondary">
                    ← Retour à l'accueil
                  </Button>
                </a>
                <a href="/recipes">
                  <Button size="sm">Voir les recettes</Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
