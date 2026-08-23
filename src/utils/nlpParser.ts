export type IntentType = 'ADD' | 'REMOVE' | 'CHECK' | 'UNCHECK' | 'SEARCH' | 'CLEAR' | 'HELP' | 'UNKNOWN';

export interface ParsedCommand {
  intent: IntentType;
  itemName?: string;
  quantity?: number;
  unit?: string;
  attributes?: string[];
  priceConstraint?: {
    type: 'UNDER' | 'OVER' | 'EQUAL';
    value: number;
  };
  raw: string;
  category?: string;
}

// Word-to-number mapping for supported languages
const NUMBER_WORDS: Record<string, number> = {
  // English
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'a': 1, 'an': 1, 'half': 0.5, 'dozen': 12,
  // Spanish
  'uno': 1, 'una': 1, 'un': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
  'media': 0.5, 'medio': 0.5, 'docena': 12,
  // French (removed duplicate 'un' and 'six')
  'une': 1, 'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5, 'sept': 7, 'huit': 8, 'neuf': 9, 'dix': 10,
  'demi': 0.5, 'douzaine': 12,
  // German
  'eins': 1, 'eine': 1, 'ein': 1, 'einer': 1, 'zwei': 2, 'drei': 3, 'vier': 4, 'fünf': 5, 'sechs': 6, 'sieben': 7, 'acht': 8, 'neun': 9, 'zehn': 10,
  'halbe': 0.5, 'halbes': 0.5, 'dutzend': 12
};

// Common units across languages
const UNIT_WORDS = [
  // English
  'bottle', 'bottles', 'pack', 'packs', 'can', 'cans', 'bag', 'bags', 'kg', 'kgs', 'kilogram', 'kilograms',
  'g', 'grams', 'lb', 'lbs', 'pound', 'pounds', 'box', 'boxes', 'liter', 'liters', 'litre', 'litres',
  'piece', 'pieces', 'loaves', 'loaf', 'bunch', 'bunches', 'slice', 'slices', 'carton', 'cartons',
  // Spanish
  'botella', 'botellas', 'paquete', 'paquetes', 'lata', 'latas', 'bolsa', 'bolsas', 'kilo', 'kilos',
  'gramo', 'gramos', 'libra', 'libras', 'caja', 'cajas', 'litro', 'litros', 'pieza', 'piezas', 'unidad', 'unidades',
  // French
  'bouteille', 'bouteilles', 'paquet', 'paquets', 'boite', 'boîtes', 'sac', 'sacs', 'gramme', 'grammes',
  'livre', 'livres', 'litre', 'litres', 'piece', 'pièces', 'tranche', 'tranches', 'carton', 'cartons',
  // German
  'flasche', 'flaschen', 'packung', 'packungen', 'dose', 'dosen', 'tüte', 'tüten', 'beutel', 'gramm',
  'pfund', 'schachtel', 'schachteln', 'liter', 'stück', 'stücke', 'scheibe', 'scheiben', 'karton'
];

// Common attributes/qualifiers
const ATTRIBUTE_WORDS = [
  'organic', 'orgánico', 'organico', 'orgánica', 'organica', 'orgánicos', 'organicos', 'orgánicas', 'organicas',
  'biologique', 'biologiques', 'bio', 'fresh', 'fresco', 'fresca', 'frescos', 'frescas', 'frais', 'frîche', 'fraiche', 'fraîches', 'fraiches',
  'frisch', 'frische', 'frischen', 'frischer', 'frisches',
  'gluten-free', 'sin gluten', 'sans gluten', 'glutenfrei', 'vegan', 'vegano', 'vegana', 'veganos', 'veganas', 'végan', 'vegatarisch',
  'large', 'grande', 'grandes', 'groß', 'große', 'großen', 'small', 'pequeño', 'pequeña', 'pequeños', 'pequeñas', 'petit', 'petite', 'klein', 'kleine',
  'sweet', 'dulce', 'dulces', 'doux', 'douce', 'süß', 'süße',
  'dark', 'negro', 'negra', 'noir', 'noire', 'dunkel', 'dunkle', 'white', 'blanco', 'blanca', 'blanc', 'blanche', 'weiß', 'weiße', 'fat-free', 'diet', 'light'
];

// Stopwords or command words to filter from item name
const STOP_WORDS = [
  // English
  'add', 'remove', 'delete', 'check', 'uncheck', 'search', 'find', 'show', 'filter', 'clear', 'list',
  'need', 'buy', 'get', 'put', 'want', 'please', 'to', 'the', 'of', 'some', 'items', 'item', 'under', 'for', 'with', 'i', 'me', 'my',
  // Spanish
  'agregar', 'añadir', 'quitar', 'eliminar', 'borrar', 'marcar', 'desmarcar', 'buscar', 'encontrar', 'filtrar',
  'limpiar', 'lista', 'necesito', 'comprar', 'quiero', 'por favor', 'el', 'la', 'los', 'las', 'un', 'una', 'de',
  'bajo', 'menos', 'que', 'con', 'para', 'yo', 'me', 'mi', 'mis',
  // French
  'ajouter', 'supprimer', 'enlever', 'retirer', 'effacer', 'cocher', 'décocher', 'chercher', 'trouver',
  'filtrer', 'vider', 'liste', 'besoin', 'acheter', 'veux', 's\'il', 'vous', 'plaît', 'le', 'la', 'les', 'des',
  'un', 'une', 'de', 'd\'', 'sous', 'moins', 'pour', 'avec', 'je', 'me', 'moi', 'mon', 'ma', 'mes',
  // German
  'hinzufügen', 'füge', 'entfernen', 'löschen', 'entferne', 'lösche', 'abhaken', 'markieren', 'suchen', 'finde',
  'zeigen', 'filtern', 'leeren', 'liste', 'brauche', 'kaufe', 'kaufen', 'möchte', 'bitte', 'den', 'die', 'das',
  'ein', 'eine', 'einen', 'von', 'unter', 'weniger', 'für', 'mit', 'ich', 'mir', 'mich', 'mein', 'meine', 'hinzu'
];

// Product Category Matcher Map
const CATEGORIES: Record<string, string[]> = {
  'Produce': [
    'apple', 'apples', 'banana', 'bananas', 'tomato', 'tomatoes', 'potato', 'potatoes', 'onion', 'onions',
    'garlic', 'lettuce', 'salad', 'spinach', 'berry', 'berries', 'strawberry', 'strawberries', 'blueberry',
    'blueberries', 'lemon', 'lemons', 'lime', 'limes', 'orange', 'oranges', 'grape', 'grapes', 'avocado',
    'avocados', 'carrot', 'carrots', 'cucumber', 'cucumbers', 'pepper', 'peppers', 'broccoli', 'mushroom',
    'mushrooms', 'pear', 'pears', 'peach', 'peaches', 'manzana', 'manzanas', 'plátano', 'platano', 'plátanos',
    'tomate', 'tomates', 'patata', 'patatas', 'cebolla', 'cebollas', 'ajo', 'lechuga', 'ensalada', 'espinaca',
    'fresa', 'fresas', 'arándano', 'arandanos', 'limón', 'limon', 'limones', 'naranja', 'naranjas', 'uva', 'uvas',
    'aguacate', 'aguacates', 'zanahoria', 'zanahorias', 'pepino', 'pepinos', 'pimiento', 'brócoli', 'champiñón',
    'pomme', 'pommes', 'banane', 'bananes', 'tomate', 'tomates', 'pomme de terre', 'oignon', 'ail', 'salade',
    'épinard', 'fraise', 'fraises', 'myrtille', 'citron', 'citrons', 'orange', 'oranges', 'raisin', 'avocat',
    'carotte', 'carottes', 'concombre', 'poivron', 'brocoli', 'champignon', 'apfel', 'äpfel', 'apfel', 'banane',
    'bananen', 'tomate', 'tomaten', 'kartoffel', 'kartoffeln', 'zwiebel', 'zwiebeln', 'knoblauch', 'salat',
    'spinat', 'erdbeere', 'erdbeeren', 'blaubeere', 'blaubeeren', 'zitrone', 'zitronen', 'orange', 'oranger',
    'traube', 'trauben', 'avocado', 'karotte', 'karotten', 'gurke', 'gurken', 'paprika', 'brokkoli', 'pilze',
    'pilz', 'fruit', 'fruits', 'fruta', 'frutas', 'obst', 'gemüse', 'vegetables', 'vegetable', 'légume', 'légumes'
  ],
  'Dairy': [
    'milk', 'leche', 'lait', 'milch', 'cheese', 'queso', 'fromage', 'käse', 'butter', 'mantequilla', 'beurre',
    'yogurt', 'yogourth', 'yoghurt', 'joghurt', 'cream', 'crema', 'crème', 'sahne', 'egg', 'eggs', 'huevo',
    'huevos', 'oeuf', 'oeufs', 'ei', 'eier', 'margarine', 'sour cream', 'quark', 'cottage cheese'
  ],
  'Bakery': [
    'bread', 'pan', 'pain', 'brot', 'loaf', 'loaves', 'roll', 'rolls', 'bun', 'buns', 'croissant', 'croissants',
    'bagel', 'bagels', 'tortilla', 'tortillas', 'baguette', 'baguettes', 'toast', 'muffin', 'muffins', 'brötchen'
  ],
  'Pantry': [
    'rice', 'arroz', 'riz', 'reis', 'pasta', 'spaghetti', 'noodle', 'noodles', 'nudeln', 'flour', 'harina',
    'farine', 'mehl', 'sugar', 'azúcar', 'azucar', 'sucre', 'zucker', 'salt', 'sal', 'sel', 'salz', 'oil',
    'aceite', 'huile', 'öl', 'vinegar', 'vinagre', 'vinaigre', 'essig', 'sauce', 'salsa', 'ketchup',
    'mustard', 'mostaza', 'moutarde', 'senf', 'honey', 'miel', 'honig', 'jam', 'mermelada', 'confiture',
    'marmelade', 'cereal', 'cereales', 'céréales', 'müsli', 'oats', 'avena', 'avoine', 'haferflocken',
    'spice', 'spices', 'especias', 'épices', 'gewürze', 'pepper', 'pimienta', 'poivre', 'pfeffer',
    'tuna', 'canned', 'beans', 'frijoles', 'lentejas', 'lentils', 'haricot', 'bohne', 'bohnen', 'mayo',
    'mayonnaise', 'olive', 'olives', 'oliven'
  ],
  'Beverages': [
    'water', 'agua', 'eau', 'wasser', 'juice', 'jugo', 'jus', 'saft', 'soda', 'coke', 'cola', 'pop',
    'beer', 'cerveza', 'bière', 'bier', 'wine', 'vino', 'vin', 'wein', 'coffee', 'café', 'cafe', 'kaffee',
    'tea', 'té', 'te', 'tee', 'lemonade', 'limonada', 'limonade', 'milkshake', 'energy drink'
  ],
  'Household': [
    'paper', 'toilet paper', 'tissue', 'tissues', 'napkin', 'napkins', 'soap', 'jabón', 'jabon', 'savon',
    'seife', 'detergent', 'detergente', 'détergent', 'waschmittel', 'cleaner', 'cleaning', 'sponge',
    'sponges', 'trash bag', 'trash bags', 'baggie', 'foil', 'wipes', 'dentifrice', 'toothpaste', 'shampoo',
    'shampoing', 'zahnpasta', 'zahnbürste', 'toothbrush', 'cepillo de dientes', 'brosse à dents'
  ],
  'Meat & Seafood': [
    'meat', 'carne', 'viande', 'fleisch', 'chicken', 'pollo', 'poulet', 'hähnchen', 'beef', 'res',
    'boeuf', 'rindfleisch', 'pork', 'cerdo', 'porc', 'schweinefleisch', 'fish', 'pescado', 'poisson',
    'fisch', 'salmon', 'salmón', 'saumon', 'lachs', 'tuna', 'atún', 'thon', 'thunfisch', 'shrimp',
    'camarón', 'crevette', 'garnele', 'turkey', 'pavo', 'dinde', 'pute', 'steak', 'sausage', 'salchicha',
    'saucisse', 'wurst', 'bacon', 'tocino', 'lard', 'speck'
  ],
  'Snacks & Frozen': [
    'chip', 'chips', 'crisps', 'patatas fritas', 'snack', 'snacks', 'chocolate', 'chocolat', 'schokolade',
    'cookie', 'cookies', 'galleta', 'galletas', 'biscuit', 'biscuits', 'keks', 'kekse', 'ice cream',
    'helado', 'glace', 'eis', 'popcorn', 'candy', 'caramelo', 'bonbon', 'bonbons', 'nuts', 'nueces',
    'noix', 'nüsse', 'pizza', 'frozen', 'congelado', 'surgelé', 'tiefkühl'
  ]
};

/**
 * Normalizes input text (lowercase, strip punctuation)
 */
function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\.(?!\d)/g, ' ') // Replace dots only if they are not followed by a digit (preserves decimals like 3.50)
    .replace(/[,\/#!%\^&\*;:{}=\-_`~()?'"\u00BF\u00A1]/g, ' ') // Keep dot and dollar/euro but remove other punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Determines the category of an item based on its name matching category keywords
 */
export function determineCategory(itemName: string): string {
  const words = cleanText(itemName).split(' ');
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    for (const keyword of keywords) {
      // Check if any word in the item name matches or contains the keyword
      if (words.some(word => word === keyword || (word.length > 3 && (word.includes(keyword) || keyword.includes(word))))) {
        return category;
      }
    }
  }
  return 'Pantry'; // Default fallback category instead of "Other" to keep it clean, or we can use "Other"
}

/**
 * Main NLP Parsing Function
 */
export function parseCommand(rawText: string): ParsedCommand {
  const cleaned = cleanText(rawText);
  if (!cleaned) {
    return { intent: 'UNKNOWN', raw: rawText };
  }

  // Define intent detection regex rules
  const intents: Record<IntentType, RegExp[]> = {
    CLEAR: [
      /^(clear|empty|delete|limpiar|vaciar|borrar|vider|nettoyer|leeren|leere) (all|list|todo|la lista|la liste|tout|alles|liste)/i,
      /^(clear|limpiar|vaciar|vider|leeren)$/i
    ],
    HELP: [
      /^(help|ayuda|aide|hilfe)$/i,
      /^(show|como|comment|wie) (help|commands|instrucciones|instructions|hilfe|befehle)/i
    ],
    UNCHECK: [
      /^(uncheck|undo|desmarcar|deshacer|decocher|décocher|demarkieren|haken weg) /i
    ],
    CHECK: [
      /^(check|complete|tick|cross|done|marcar|completar|hecho|tachar|cocher|fait|termine|terminé|erledigen|abhaken|markieren|haken) /i
    ],
    REMOVE: [
      /^(remove|delete|take away|clear|quitar|eliminar|borrar|saca|sacar|supprimer|enlever|retirer|effacer|entfernen|löschen|entferne|lösche|wegnehmen) /i
    ],
    SEARCH: [
      /^(search|find|show|filter|buscar|encontrar|filtrar|chercher|trouver|suchen|finde|zeigen|filtern) /i,
      /^(under|bajo|menos de|sous|unter) /i
    ],
    ADD: [
      /^(add|need|buy|get|put|want|agregar|añadir|necesito|comprar|quiero|pon|poner|ajouter|prends|prendre|veux|besoin|hinzufügen|füge|brauche|kaufe|kaufen|möchte|pack|packe|tu) /i,
      // Fallback: If it's just "2 apples" or "milk", we assume it is an ADD intent
      /^[a-zA-Z0-9]/i
    ],
    UNKNOWN: []
  };

  let intent: IntentType = 'UNKNOWN';
  let matchedPattern = false;

  for (const [type, patterns] of Object.entries(intents)) {
    if (type === 'UNKNOWN') continue;
    for (const pattern of patterns) {
      if (pattern.test(cleaned)) {
        intent = type as IntentType;
        matchedPattern = true;
        break;
      }
    }
    if (matchedPattern) break;
  }

  // If no patterns matched, check if it starts with a number or attribute
  if (intent === 'UNKNOWN') {
    const firstWord = cleaned.split(' ')[0];
    if (!isNaN(Number(firstWord)) || NUMBER_WORDS[firstWord] !== undefined) {
      intent = 'ADD';
    } else {
      intent = 'ADD'; // Default intent for shopping lists is usually adding items
    }
  }

  let workingText = cleaned;

  // 1. Parse Price Constraints (often in SEARCH, but can be anywhere)
  let priceConstraint: ParsedCommand['priceConstraint'] = undefined;
  // Match patterns like "under $5", "under 5 dollars", "menos de 5", "sous 5 dollars", "unter 5 euro"
  const priceRegex = /(?:under|bajo|menos de|sous|unter|less than|moins de|weniger als)\s*(?:[\$\u20AC\u00A3])?\s*(\d+(?:\.\d{2})?)\s*(?:dollars?|euros?|pounds?|dolares?|dólares?|€|\$)?/i;
  const priceMatch = workingText.match(priceRegex);
  if (priceMatch) {
    priceConstraint = {
      type: 'UNDER',
      value: parseFloat(priceMatch[1])
    };
    workingText = workingText.replace(priceRegex, '').trim();
  }

  // 2. Extract Quantity
  let quantity = 1;
  let hasExplicitQuantity = false;
  // Matches "2.5", "5", "two", "dos", "zwei", etc. at the start of strings or after verbs
  const words = workingText.split(' ');
  for (let i = 0; i < Math.min(words.length, 3); i++) {
    const word = words[i];
    // Check if it's a number
    if (!isNaN(Number(word))) {
      quantity = Number(word);
      hasExplicitQuantity = true;
      words[i] = ''; // remove
      break;
    }
    // Check if word-number mapping exists
    if (NUMBER_WORDS[word] !== undefined) {
      quantity = NUMBER_WORDS[word];
      hasExplicitQuantity = true;
      words[i] = ''; // remove
      break;
    }
  }
  workingText = words.filter(Boolean).join(' ');

  // 3. Extract Unit
  let unit: string | undefined = undefined;
  const currentWords = workingText.split(' ');
  for (let i = 0; i < Math.min(currentWords.length, 3); i++) {
    const word = currentWords[i];
    if (UNIT_WORDS.includes(word)) {
      unit = word;
      currentWords[i] = ''; // remove
      break;
    }
  }
  workingText = currentWords.filter(Boolean).join(' ');

  // 4. Extract Attributes
  const attributes: string[] = [];
  const afterUnitWords = workingText.split(' ');
  for (let i = 0; i < afterUnitWords.length; i++) {
    const word = afterUnitWords[i];
    if (ATTRIBUTE_WORDS.includes(word)) {
      attributes.push(word);
      afterUnitWords[i] = ''; // remove
    }
  }
  workingText = afterUnitWords.filter(Boolean).join(' ');

  // 5. Cleanup remaining stopwords to extract final item name
  const finalWords = workingText.split(' ');
  const cleanedItemWords = finalWords.filter(word => !STOP_WORDS.includes(word));
  const itemName = cleanedItemWords.join(' ').trim();

  // Determine Category for ADD intent
  let category: string | undefined = undefined;
  if (intent === 'ADD' && itemName) {
    category = determineCategory(itemName);
  }

  return {
    intent,
    itemName: itemName || undefined,
    quantity: hasExplicitQuantity ? quantity : undefined,
    unit,
    attributes: attributes.length > 0 ? attributes : undefined,
    priceConstraint,
    raw: rawText,
    category
  };
}
