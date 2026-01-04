# Prompt pour l'extraction et conversion de recettes en CSV

Utilisez ce prompt avec une IA (Claude, ChatGPT, etc.) pour extraire des recettes de pages web et les convertir au format CSV compatible avec l'application.

## Prompt à utiliser

```
Tu es un assistant spécialisé dans l'extraction de recettes depuis des pages web.

Je vais te fournir une ou plusieurs URLs de recettes. Pour chaque recette, tu dois :

1. Extraire les informations suivantes :
   - Titre de la recette
   - Description (facultatif)
   - Temps de préparation en minutes (prepMin)
   - Temps de cuisson en minutes (cookMin)
   - Nombre de portions par défaut (servingsDefault)
   - Tags (dessert, rapide, italien, etc.) - array JSON
   - Ingrédients avec les détails suivants pour chacun :
     * name : nom normalisé de l'ingrédient (en minuscules)
     * qtyPerPerson : quantité par personne (nombre décimal)
     * unit : code de l'unité (g, kg, mL, L, piece, cac, cas)
     * storeSection : rayon du magasin (primeur, crèmerie, boucherie, épicerie salée, sucré, surgelé, etc.)
     * storeName : nom du magasin ou type (Auchan, Supermarché, Primeur, Boulangerie, etc.)
   - Étapes de préparation (array JSON de strings)

2. Convertir ces informations au format CSV avec les colonnes suivantes :
   titre,description,prepMin,cookMin,servingsDefault,tags,ingredients,steps

3. Règles importantes :
   - Les colonnes tags, ingredients et steps doivent être au format JSON
   - Les qtyPerPerson doivent être calculées PAR PERSONNE (diviser la quantité totale par servingsDefault)
   - Les champs CSV contenant des virgules ou guillemets doivent être échappés avec des guillemets doubles
   - Les guillemets dans les champs doivent être doublés ("")
   - Normaliser les noms d'ingrédients (minuscules, sans accents spéciaux)
   - Utiliser les unités standards : g, kg, mL, L, piece, cac (cuillère à café), cas (cuillère à soupe)

4. Format de sortie attendu :
   - Une ligne d'en-tête
   - Une ligne par recette
   - Pas d'espaces superflus
   - Encodage UTF-8

Exemple de ligne CSV :
```
"Pâtes Carbonara","Recette italienne traditionnelle",15,10,4,"[""italien"",""rapide"",""pates""]","[{""name"":""pates"",""qtyPerPerson"":100,""unit"":""g"",""storeSection"":""épicerie salée"",""storeName"":""Auchan""},{""name"":""lardons"",""qtyPerPerson"":50,""unit"":""g"",""storeSection"":""boucherie"",""storeName"":""Auchan""},{""name"":""parmesan"",""qtyPerPerson"":25,""unit"":""g"",""storeSection"":""crèmerie"",""storeName"":""Auchan""},{""name"":""oeuf"",""qtyPerPerson"":1,""unit"":""piece"",""storeSection"":""crèmerie"",""storeName"":""Auchan""}]","[""Cuire les pâtes dans l'eau bouillante salée selon les instructions"",""Faire revenir les lardons dans une poêle"",""Battre les œufs avec le parmesan râpé"",""Mélanger les pâtes chaudes avec les lardons et le mélange œuf-parmesan"",""Servir immédiatement avec du poivre""]"
```

Voici les URL(s) de recette(s) à extraire :
[INSÉRER VOS URLs ICI]

Fournis-moi le résultat au format CSV prêt à être importé.
```

## Unités disponibles

| Code | Type | Description | Ratio vers base |
|------|------|-------------|-----------------|
| g | mass | gramme | 1 |
| kg | mass | kilogramme | 1000 |
| mL | volume | millilitre | 1 |
| L | volume | litre | 1000 |
| piece | count | pièce(s) | 1 |
| cac | volume | cuillère à café | 5 |
| cas | volume | cuillère à soupe | 15 |

## Rayons suggérés (storeSection)

- primeur
- crèmerie
- boucherie
- poissonnerie
- épicerie salée
- sucré (épicerie sucrée)
- surgelé
- boissons
- bio

## Exemple d'utilisation

1. Copiez le prompt ci-dessus
2. Remplacez `[INSÉRER VOS URLs ICI]` par vos URLs de recettes
3. Envoyez à une IA (Claude, ChatGPT, etc.)
4. Copiez le résultat CSV
5. Allez dans Paramètres → Import
6. Uploadez le fichier CSV

## Notes

- L'IA peut avoir besoin d'accéder aux pages web (si elle a accès à internet)
- Sinon, vous pouvez copier-coller le contenu de la page dans votre prompt
- Vérifiez toujours le résultat avant l'import
- Les erreurs d'import seront affichées avec le numéro de ligne concerné
