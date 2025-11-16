"use server";

import * as cheerio from "cheerio";

export type ImportedRecipe = {
  title: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  prepMin?: number;
  cookMin?: number;
  servings?: number;
  sourceUrl: string;
};

export type ImportResult = {
  success: boolean;
  data?: ImportedRecipe;
  error?: string;
};

/**
 * Importe une recette depuis une URL (Marmiton, 750g, etc.)
 */
export async function importRecipeFromUrl(url: string): Promise<ImportResult> {
  try {
    // Validation de l'URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Vérifier que c'est un site supporté
    const supportedSites = ["marmiton.org", "750g.com"];
    const isSupported = supportedSites.some((site) => hostname.includes(site));

    if (!isSupported) {
      return {
        success: false,
        error: `Site non supporté. Sites supportés : ${supportedSites.join(", ")}`,
      };
    }

    // Récupérer le HTML de la page
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Erreur lors de la récupération de la page (${response.status})`,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Parser selon le site
    let recipe: ImportedRecipe;

    if (hostname.includes("marmiton.org")) {
      recipe = parseMarmiton($, url);
    } else if (hostname.includes("750g.com")) {
      recipe = parse750g($, url);
    } else {
      return {
        success: false,
        error: "Site non supporté",
      };
    }

    // Validation du résultat
    if (!recipe.title || recipe.ingredients.length === 0) {
      return {
        success: false,
        error: "Impossible d'extraire les données de la recette. Le format du site a peut-être changé.",
      };
    }

    return {
      success: true,
      data: recipe,
    };
  } catch (error) {
    console.error("Erreur lors de l'import:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue lors de l'import",
    };
  }
}

/**
 * Parse une recette Marmiton
 */
function parseMarmiton($: cheerio.CheerioAPI, url: string): ImportedRecipe {
  // Titre
  const title =
    $('h1[class*="recipe-header__title"]').text().trim() ||
    $('h1[itemprop="name"]').text().trim() ||
    $("h1").first().text().trim();

  // Description
  const description =
    $('p[class*="recipe-header__description"]').text().trim() ||
    $('div[itemprop="description"]').text().trim() ||
    "";

  // Ingrédients
  const ingredients: string[] = [];
  $('div[class*="ingredient-card"], [itemprop="recipeIngredient"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text) ingredients.push(text);
  });

  // Si pas trouvé, essayer une autre méthode
  if (ingredients.length === 0) {
    $('.recipe-ingredients li, .mrtn-recette_ingredients li').each((_, el) => {
      const text = $(el).text().trim();
      if (text) ingredients.push(text);
    });
  }

  // Étapes
  const steps: string[] = [];
  $('div[class*="recipe-step-list__container"] p, [itemprop="recipeInstructions"] p').each(
    (_, el) => {
      const text = $(el).text().trim();
      if (text && !text.startsWith("Étape")) {
        steps.push(text);
      }
    }
  );

  // Si pas trouvé, essayer une autre méthode
  if (steps.length === 0) {
    $('.recipe-preparation__list li, .mrtn-recette_preparation li').each((_, el) => {
      const text = $(el).text().trim();
      if (text) steps.push(text);
    });
  }

  // Temps de préparation (en minutes)
  const prepTimeText = $('[class*="recipe-infos__timmings__preparation"]').text().trim();
  const prepMin = extractMinutes(prepTimeText);

  // Temps de cuisson (en minutes)
  const cookTimeText = $('[class*="recipe-infos__timmings__cooking"]').text().trim();
  const cookMin = extractMinutes(cookTimeText);

  // Nombre de personnes
  const servingsText = $('[class*="recipe-infos__quantity"]').text().trim();
  const servings = extractServings(servingsText);

  return {
    title,
    description: description || undefined,
    ingredients,
    steps,
    prepMin,
    cookMin,
    servings,
    sourceUrl: url,
  };
}

/**
 * Parse une recette 750g
 */
function parse750g($: cheerio.CheerioAPI, url: string): ImportedRecipe {
  // Titre
  const title =
    $('h1[itemprop="name"]').text().trim() ||
    $("h1.recipe-title").text().trim() ||
    $("h1").first().text().trim();

  // Description
  const description = $('div[itemprop="description"]').text().trim() || "";

  // Ingrédients
  const ingredients: string[] = [];
  $('[itemprop="recipeIngredient"], .recipe-ingredients li').each((_, el) => {
    const text = $(el).text().trim();
    if (text) ingredients.push(text);
  });

  // Étapes
  const steps: string[] = [];
  $('[itemprop="recipeInstructions"] li, .recipe-steps li').each((_, el) => {
    const text = $(el).text().trim();
    if (text) steps.push(text);
  });

  // Temps
  const prepTimeText = $('[itemprop="prepTime"]').attr("content") || "";
  const prepMin = extractMinutesFromISO(prepTimeText);

  const cookTimeText = $('[itemprop="cookTime"]').attr("content") || "";
  const cookMin = extractMinutesFromISO(cookTimeText);

  // Nombre de personnes
  const servingsText =
    $('[itemprop="recipeYield"]').text().trim() || $(".recipe-servings").text().trim();
  const servings = extractServings(servingsText);

  return {
    title,
    description: description || undefined,
    ingredients,
    steps,
    prepMin,
    cookMin,
    servings,
    sourceUrl: url,
  };
}

/**
 * Extrait le nombre de minutes d'un texte (ex: "15 min", "1h30")
 */
function extractMinutes(text: string): number | undefined {
  if (!text) return undefined;

  const normalized = text.toLowerCase().replace(/\s+/g, "");

  // Format "1h30" ou "1h 30"
  const hoursMinMatch = normalized.match(/(\d+)h(?:eures?)?(\d+)?/);
  if (hoursMinMatch) {
    const hours = parseInt(hoursMinMatch[1]);
    const mins = hoursMinMatch[2] ? parseInt(hoursMinMatch[2]) : 0;
    return hours * 60 + mins;
  }

  // Format "45min" ou "45 min"
  const minMatch = normalized.match(/(\d+)m(?:in)?/);
  if (minMatch) {
    return parseInt(minMatch[1]);
  }

  return undefined;
}

/**
 * Extrait les minutes d'un format ISO 8601 (ex: "PT15M", "PT1H30M")
 */
function extractMinutesFromISO(iso: string): number | undefined {
  if (!iso) return undefined;

  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return undefined;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;

  return hours * 60 + minutes || undefined;
}

/**
 * Extrait le nombre de personnes d'un texte
 */
function extractServings(text: string): number | undefined {
  if (!text) return undefined;

  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1]) : undefined;
}
