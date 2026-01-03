// Mapping de mots-clés vers emojis appropriés
export function getRecipeEmoji(title: string): string {
  const titleLower = title.toLowerCase();

  // Plats principaux
  if (titleLower.includes('pizza')) return '🍕';
  if (titleLower.includes('burger')) return '🍔';
  if (titleLower.includes('pâtes') || titleLower.includes('spaghetti') || titleLower.includes('pasta')) return '🍝';
  if (titleLower.includes('soupe')) return '🍲';
  if (titleLower.includes('salade')) return '🥗';
  if (titleLower.includes('poulet') || titleLower.includes('chicken')) return '🍗';
  if (titleLower.includes('poisson') || titleLower.includes('fish')) return '🐟';
  if (titleLower.includes('viande') || titleLower.includes('steak') || titleLower.includes('bœuf') || titleLower.includes('boeuf')) return '🥩';
  if (titleLower.includes('curry')) return '🍛';
  if (titleLower.includes('riz') || titleLower.includes('rice')) return '🍚';
  if (titleLower.includes('sushi')) return '🍣';
  if (titleLower.includes('taco')) return '🌮';
  if (titleLower.includes('wrap') || titleLower.includes('burrito')) return '🌯';
  if (titleLower.includes('hot dog') || titleLower.includes('hotdog')) return '🌭';
  if (titleLower.includes('frites') || titleLower.includes('fries')) return '🍟';

  // Légumes et végétarien
  if (titleLower.includes('avocat') || titleLower.includes('avocado')) return '🥑';
  if (titleLower.includes('aubergine') || titleLower.includes('eggplant')) return '🍆';
  if (titleLower.includes('carotte') || titleLower.includes('carrot')) return '🥕';
  if (titleLower.includes('brocoli') || titleLower.includes('broccoli')) return '🥦';

  // Desserts
  if (titleLower.includes('gâteau') || titleLower.includes('cake')) return '🍰';
  if (titleLower.includes('crêpe') || titleLower.includes('pancake')) return '🥞';
  if (titleLower.includes('cookie') || titleLower.includes('biscuit')) return '🍪';
  if (titleLower.includes('tarte') || titleLower.includes('pie')) return '🥧';
  if (titleLower.includes('glace') || titleLower.includes('ice cream')) return '🍨';
  if (titleLower.includes('cupcake') || titleLower.includes('muffin')) return '🧁';
  if (titleLower.includes('donut') || titleLower.includes('doughnut')) return '🍩';
  if (titleLower.includes('chocolat') || titleLower.includes('chocolate')) return '🍫';
  if (titleLower.includes('bonbon') || titleLower.includes('candy')) return '🍬';

  // Boissons
  if (titleLower.includes('smoothie') || titleLower.includes('jus') || titleLower.includes('juice')) return '🥤';
  if (titleLower.includes('café') || titleLower.includes('coffee')) return '☕';
  if (titleLower.includes('thé') || titleLower.includes('tea')) return '🍵';
  if (titleLower.includes('vin') || titleLower.includes('wine')) return '🍷';
  if (titleLower.includes('bière') || titleLower.includes('beer')) return '🍺';
  if (titleLower.includes('cocktail')) return '🍹';

  // Pain et petit-déjeuner
  if (titleLower.includes('pain') || titleLower.includes('bread') || titleLower.includes('baguette')) return '🍞';
  if (titleLower.includes('sandwich')) return '🥪';
  if (titleLower.includes('croissant')) return '🥐';
  if (titleLower.includes('bagel')) return '🥯';
  if (titleLower.includes('œuf') || titleLower.includes('oeuf') || titleLower.includes('egg')) return '🍳';
  if (titleLower.includes('bacon')) return '🥓';

  // Fruits
  if (titleLower.includes('fraise') || titleLower.includes('strawberry')) return '🍓';
  if (titleLower.includes('pomme') || titleLower.includes('apple')) return '🍎';
  if (titleLower.includes('banane') || titleLower.includes('banana')) return '🍌';
  if (titleLower.includes('citron') || titleLower.includes('lemon')) return '🍋';
  if (titleLower.includes('pastèque') || titleLower.includes('watermelon')) return '🍉';
  if (titleLower.includes('raisin') || titleLower.includes('grape')) return '🍇';

  // Divers
  if (titleLower.includes('fromage') || titleLower.includes('cheese')) return '🧀';
  if (titleLower.includes('pâtisserie') || titleLower.includes('pastry')) return '🥐';

  // Par défaut
  return '🍽️';
}
