# Composants UI

Bibliothèque de composants réutilisables pour l'application de recettes.

## Installation

```tsx
import { Button, Input, Card, CardHeader, CardTitle } from "@/components/ui";
```

---

## Button

Bouton avec variants, tailles, et état de chargement.

### Props

| Prop       | Type                                 | Défaut    | Description                    |
| ---------- | ------------------------------------ | --------- | ------------------------------ |
| variant    | "primary" \| "secondary" \| "danger" | "primary" | Style du bouton                |
| size       | "sm" \| "md" \| "lg"                 | "md"      | Taille du bouton               |
| fullWidth  | boolean                              | false     | Prend toute la largeur         |
| isLoading  | boolean                              | false     | Affiche un spinner de chargement |

### Exemples

```tsx
// Bouton primaire basique
<Button>Enregistrer</Button>

// Bouton danger avec taille large
<Button variant="danger" size="lg">
  Supprimer
</Button>

// Bouton secondaire pleine largeur
<Button variant="secondary" fullWidth>
  Annuler
</Button>

// Bouton avec état de chargement
<Button isLoading disabled>
  Chargement...
</Button>

// Bouton avec icône
<Button>
  <span>📋</span>
  Générer la liste
</Button>
```

---

## Input

Input avec label, message d'erreur, et hint.

### Props

| Prop      | Type    | Défaut | Description                     |
| --------- | ------- | ------ | ------------------------------- |
| label     | string  | -      | Label affiché au-dessus         |
| error     | string  | -      | Message d'erreur                |
| hint      | string  | -      | Texte d'aide                    |
| fullWidth | boolean | false  | Prend toute la largeur          |
| required  | boolean | false  | Ajoute un astérisque au label   |

### Exemples

```tsx
// Input simple avec label
<Input label="Nom de la recette" />

// Input requis avec hint
<Input
  label="Email"
  type="email"
  required
  hint="Nous ne partagerons jamais votre email"
/>

// Input avec erreur
<Input
  label="Mot de passe"
  type="password"
  error="Le mot de passe doit contenir au moins 8 caractères"
/>

// Input pleine largeur
<Input
  label="Description"
  fullWidth
  placeholder="Décrivez votre recette..."
/>

// Input avec ref (formulaire contrôlé)
const inputRef = useRef<HTMLInputElement>(null);
<Input ref={inputRef} label="Quantité" type="number" />
```

---

## Card

Carte composable pour afficher du contenu structuré.

### Composants

- `Card` - Conteneur principal
- `CardHeader` - En-tête de la carte
- `CardTitle` - Titre dans l'en-tête
- `CardDescription` - Description sous le titre
- `CardContent` - Contenu principal
- `CardFooter` - Pied de page

### Props Card

| Prop    | Type                         | Défaut | Description                |
| ------- | ---------------------------- | ------ | -------------------------- |
| hover   | boolean                      | false  | Effet hover avec ombre     |
| padding | "none" \| "sm" \| "md" \| "lg" | "md"   | Padding de la carte        |

### Props CardTitle

| Prop | Type                                     | Défaut | Description          |
| ---- | ---------------------------------------- | ------ | -------------------- |
| as   | "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" | "h3"   | Balise HTML du titre |

### Exemples

```tsx
// Carte simple
<Card>
  <CardHeader>
    <CardTitle>Crêpes sucrées</CardTitle>
    <CardDescription>Parfaites pour le vendredi soir</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Une recette simple et délicieuse...</p>
  </CardContent>
  <CardFooter>
    <Button size="sm">Voir la recette</Button>
  </CardFooter>
</Card>

// Carte avec effet hover
<Card hover onClick={() => console.log("Cliqué!")}>
  <CardTitle>Recette cliquable</CardTitle>
  <CardContent>Cliquez pour en savoir plus</CardContent>
</Card>

// Carte sans padding (pour image pleine largeur)
<Card padding="none">
  <img src="/recipe.jpg" alt="Recette" className="w-full rounded-t-lg" />
  <div className="p-4">
    <CardTitle>Tarte aux pommes</CardTitle>
    <CardDescription>Dessert traditionnel</CardDescription>
  </div>
</Card>

// Carte avec titre personnalisé
<Card>
  <CardHeader>
    <CardTitle as="h2">Titre principal</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <p>Contenu de la carte...</p>
    </div>
  </CardContent>
</Card>

// Liste de recettes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {recipes.map((recipe) => (
    <Card key={recipe.id} hover>
      <CardHeader>
        <CardTitle>{recipe.title}</CardTitle>
        <CardDescription>{recipe.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 text-sm text-gray-600">
          <span>⏱️ {recipe.prepMin} min</span>
          <span>👥 {recipe.servingsDefault} pers.</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" fullWidth>
          Voir
        </Button>
      </CardFooter>
    </Card>
  ))}
</div>
```

---

## Conseils d'utilisation

### Imports groupés
```tsx
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
```

### Combinaison avec d'autres props
Tous les composants acceptent les props HTML standards :

```tsx
<Button onClick={() => alert("Cliqué!")} disabled>
  Bouton désactivé
</Button>

<Input
  label="Email"
  type="email"
  onChange={(e) => setEmail(e.target.value)}
  onBlur={handleValidation}
/>

<Card className="border-2 border-blue-500">
  Carte personnalisée
</Card>
```

### Accessibilité
- Les inputs génèrent automatiquement des IDs uniques
- Les erreurs utilisent `aria-invalid` et `role="alert"`
- Les boutons supportent `disabled` et les états de focus
- Tous les composants sont compatibles avec les lecteurs d'écran
