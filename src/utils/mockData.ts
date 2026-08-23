export interface SuggestionItem {
  id: string;
  name: string;
  category: string;
  price: number;
  reason: string; // e.g. "In Season", "On Sale", "Bought 6 days ago"
  type: 'seasonal' | 'history' | 'substitution';
  originalItem?: string; // used for substitutions
}

export const SEASONAL_ITEMS: SuggestionItem[] = [
  { id: 's1', name: 'Organic Strawberries', category: 'Produce', price: 3.49, reason: 'In Season', type: 'seasonal' },
  { id: 's2', name: 'Fresh Asparagus', category: 'Produce', price: 2.99, reason: 'In Season', type: 'seasonal' },
  { id: 's3', name: 'Sweet Yellow Peaches', category: 'Produce', price: 1.99, reason: 'In Season', type: 'seasonal' },
  { id: 's4', name: 'Haas Avocados', category: 'Produce', price: 0.99, reason: 'On Sale - 30% Off', type: 'seasonal' },
  { id: 's5', name: 'Local Wildflower Honey', category: 'Pantry', price: 5.99, reason: 'On Sale - BOGO', type: 'seasonal' }
];

export const HISTORY_ITEMS: SuggestionItem[] = [
  { id: 'h1', name: 'Organic Eggs (Dozen)', category: 'Dairy', price: 4.29, reason: 'Usually bought every 6 days (bought 7d ago)', type: 'history' },
  { id: 'h2', name: 'Whole Milk (1 Gal)', category: 'Dairy', price: 3.89, reason: 'Usually bought every 7 days (bought 8d ago)', type: 'history' },
  { id: 'h3', name: 'Sourdough Bread', category: 'Bakery', price: 4.99, reason: 'Usually bought every 4 days (bought 5d ago)', type: 'history' },
  { id: 'h4', name: 'Ground Coffee (Medium Roast)', category: 'Beverages', price: 8.99, reason: 'Usually bought every 14 days (bought 15d ago)', type: 'history' }
];

// Map of item names (lowercase) to their smart substitutions
export const SUBSTITUTIONS_MAP: Record<string, Omit<SuggestionItem, 'id' | 'type'>> = {
  'milk': { name: 'Oat Milk (Unsweetened)', category: 'Dairy', price: 3.99, reason: 'Plant-based alternative' },
  'whole milk': { name: 'Oat Milk (Unsweetened)', category: 'Dairy', price: 3.99, reason: 'Plant-based alternative' },
  'dairy milk': { name: 'Almond Milk (Unsweetened)', category: 'Dairy', price: 3.29, reason: 'Low calorie alternative' },
  'white bread': { name: 'Gluten-Free Seeded Bread', category: 'Bakery', price: 5.49, reason: 'Gluten-free alternative' },
  'sugar': { name: 'Organic Stevia Sweetener', category: 'Pantry', price: 4.89, reason: 'Zero calorie sweetener' },
  'pasta': { name: 'Chickpea Penne Pasta', category: 'Pantry', price: 2.79, reason: 'High-protein, gluten-free' },
  'spaghetti': { name: 'Zucchini Noodles', category: 'Produce', price: 3.19, reason: 'Low carb vegetable alternative' },
  'potato chips': { name: 'Baked Kale Chips', category: 'Snacks & Frozen', price: 3.49, reason: 'Lower fat, organic' },
  'chips': { name: 'Baked Lentil Crisps', category: 'Snacks & Frozen', price: 2.99, reason: 'Nutritious alternative' },
  'butter': { name: 'Extra Virgin Olive Oil Spread', category: 'Dairy', price: 4.59, reason: 'Heart-healthy fat' }
};
