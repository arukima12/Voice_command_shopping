import React from 'react';
import { Sparkles, History, ShoppingBag, ArrowRight } from 'lucide-react';
import { SEASONAL_ITEMS, HISTORY_ITEMS, SUBSTITUTIONS_MAP } from '../utils/mockData';
import type { ShoppingItem } from './ShoppingList';

interface SuggestionsPanelProps {
  shoppingItems: ShoppingItem[];
  onAddSuggestion: (name: string, category: string, price?: number) => void;
  onSwapItem: (originalId: string, name: string, category: string, price?: number) => void;
}

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  shoppingItems,
  onAddSuggestion,
  onSwapItem
}) => {
  // 1. Identify active substitutions based on current items in the list
  const activeSubstitutions: { originalItem: ShoppingItem; replacement: any }[] = [];

  shoppingItems.forEach(item => {
    // If the item is already completed, don't suggest a substitution
    if (item.completed) return;

    const key = item.name.toLowerCase().trim();
    // Try exact or prefix match
    let replacement = SUBSTITUTIONS_MAP[key];
    
    // If no exact match, try matching parts of the name
    if (!replacement) {
      const matchKey = Object.keys(SUBSTITUTIONS_MAP).find(k => key.includes(k) || k.includes(key));
      if (matchKey) {
        replacement = SUBSTITUTIONS_MAP[matchKey];
      }
    }

    if (replacement) {
      // Check if replacement is already in the list to avoid duplicate suggestions
      const isAlreadyInList = shoppingItems.some(
        si => si.name.toLowerCase() === replacement.name.toLowerCase()
      );

      if (!isAlreadyInList) {
        activeSubstitutions.push({
          originalItem: item,
          replacement
        });
      }
    }
  });

  // Filter history items to show only those not currently in the shopping list
  const availableHistory = HISTORY_ITEMS.filter(
    item => !shoppingItems.some(si => si.name.toLowerCase() === item.name.toLowerCase())
  );

  // Filter seasonal items to show only those not currently in the shopping list
  const availableSeasonal = SEASONAL_ITEMS.filter(
    item => !shoppingItems.some(si => si.name.toLowerCase() === item.name.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Smart Substitutions Section (Context-driven) */}
      {activeSubstitutions.length > 0 && (
        <div className="border border-neutral-900 dark:border-neutral-100 bg-neutral-950 text-white dark:bg-white dark:text-black p-5 rounded transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <h3 className="text-xs font-mono font-bold tracking-widest uppercase">
              SMART SUGGESTIONS
            </h3>
          </div>
          
          <div className="space-y-4">
            {activeSubstitutions.map(({ originalItem, replacement }, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 p-3 bg-neutral-900 dark:bg-neutral-50 rounded border border-neutral-800 dark:border-neutral-200"
              >
                <div className="flex justify-between items-start gap-1">
                  <div className="text-xs font-mono">
                    <span className="text-neutral-400 dark:text-neutral-500 line-through mr-1">
                      {originalItem.name}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 inline mx-1 text-neutral-400" />
                    <span className="font-bold text-white dark:text-black">{replacement.name}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-neutral-800 dark:bg-neutral-200 text-neutral-300 dark:text-neutral-700 px-1.5 py-0.5 rounded">
                    +${(replacement.price - (originalItem.price || 0)).toFixed(2)} diff
                  </span>
                </div>
                
                <p className="text-[11px] text-neutral-400 dark:text-neutral-600 leading-tight">
                  {replacement.reason}
                </p>

                <div className="flex justify-between items-center mt-1 pt-2 border-t border-neutral-800 dark:border-neutral-200">
                  <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                    ${replacement.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() =>
                      onSwapItem(originalItem.id, replacement.name, replacement.category, replacement.price)
                    }
                    className="px-2.5 py-1 bg-white hover:bg-neutral-200 dark:bg-black dark:hover:bg-neutral-800 text-black dark:text-white text-[10px] font-mono font-bold tracking-wider rounded transition-colors"
                  >
                    SWAP ITEM
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Frequency/History-Based Repurchase Suggestions */}
      {availableHistory.length > 0 && (
        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-5 rounded transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <h3 className="text-xs font-mono font-bold tracking-widest text-neutral-900 dark:text-neutral-100 uppercase">
              BOUGHT FREQUENTLY
            </h3>
          </div>

          <div className="space-y-3">
            {availableHistory.slice(0, 3).map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-900 last:border-b-0 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                    {item.reason}
                  </p>
                </div>
                <button
                  onClick={() => onAddSuggestion(item.name, item.category, item.price)}
                  className="px-2.5 py-1 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-950 text-neutral-800 dark:text-neutral-200 text-[10px] font-mono rounded transition-colors flex-shrink-0"
                >
                  + ADD (${item.price.toFixed(2)})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Seasonal / On-Sale Recommendations */}
      {availableSeasonal.length > 0 && (
        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-5 rounded transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <h3 className="text-xs font-mono font-bold tracking-widest text-neutral-900 dark:text-neutral-100 uppercase">
              SEASONAL & SALES
            </h3>
          </div>

          <div className="space-y-3">
            {availableSeasonal.slice(0, 3).map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-900 last:border-b-0 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                    {item.reason}
                  </p>
                </div>
                <button
                  onClick={() => onAddSuggestion(item.name, item.category, item.price)}
                  className="px-2.5 py-1 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-950 text-neutral-800 dark:text-neutral-200 text-[10px] font-mono rounded transition-colors flex-shrink-0"
                >
                  + ADD (${item.price.toFixed(2)})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
