import React from 'react';
import { Plus, Minus, Trash2, Filter } from 'lucide-react';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  attributes?: string[];
  price?: number;
  completed: boolean;
  category: string;
  addedAt: string;
}

interface ShoppingListProps {
  items: ShoppingItem[];
  filterText: string;
  priceFilter: number | null;
  onToggleComplete: (id: string) => void;
  onIncrementQuantity: (id: string) => void;
  onDecrementQuantity: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearFilters: () => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  filterText,
  priceFilter,
  onToggleComplete,
  onIncrementQuantity,
  onDecrementQuantity,
  onDeleteItem,
  onClearFilters
}) => {
  // 1. Filter items based on active text search and price constraints
  const filteredItems = items.filter(item => {
    // Text matching (matches item name, attributes, or category)
    const matchesText = filterText
      ? item.name.toLowerCase().includes(filterText.toLowerCase()) ||
        item.category.toLowerCase().includes(filterText.toLowerCase()) ||
        (item.attributes && item.attributes.some(attr => attr.toLowerCase().includes(filterText.toLowerCase())))
      : true;

    // Price matching
    const matchesPrice = priceFilter !== null
      ? item.price !== undefined && item.price <= priceFilter
      : true;

    return matchesText && matchesPrice;
  });

  // 2. Group items by category
  const groupedItems: Record<string, ShoppingItem[]> = {};
  filteredItems.forEach(item => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  const categories = Object.keys(groupedItems).sort();
  const hasActiveFilters = Boolean(filterText || priceFilter !== null);

  return (
    <div className="flex flex-col h-full">
      {/* Active Filter Indicators */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/20 px-4 py-3 mb-6 rounded text-xs font-mono">
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
            <Filter className="w-3.5 h-3.5" />
            <span>ACTIVE FILTERS:</span>
            {filterText && (
              <span className="bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-2 py-0.5 rounded">
                "{filterText}"
              </span>
            )}
            {priceFilter !== null && (
              <span className="bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-2 py-0.5 rounded">
                Under ${priceFilter.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={onClearFilters}
            className="text-neutral-800 dark:text-neutral-200 hover:underline hover:text-black dark:hover:text-white font-bold"
          >
            CLEAR FILTERS
          </button>
        </div>
      )}

      {/* Shopping List Items grouped by Category */}
      {items.length === 0 ? (
        // Empty state when list is completely empty
        <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-12 h-16 border border-neutral-300 dark:border-neutral-700 rounded p-2 mb-4 relative flex flex-col justify-between">
            <div className="h-0.5 w-full bg-neutral-300 dark:bg-neutral-700"></div>
            <div className="h-0.5 w-4/5 bg-neutral-300 dark:bg-neutral-700"></div>
            <div className="h-0.5 w-full bg-neutral-300 dark:bg-neutral-700"></div>
            <div className="h-0.5 w-3/4 bg-neutral-300 dark:bg-neutral-700"></div>
          </div>
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-2">
            No Items in List
          </h3>
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500 max-w-[240px] leading-relaxed">
            Use the voice command or the manual input below to start building your shopping assistant list.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        // Empty state when search filters produce no results
        <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-2">
            No Matches Found
          </h3>
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500 max-w-[240px] mb-4">
            Try adjusting your voice search filters or clear them to show all items.
          </p>
          <button
            onClick={onClearFilters}
            className="px-4 py-2 border border-black dark:border-white text-xs font-mono hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded transition-all"
          >
            CLEAR ACTIVE FILTERS
          </button>
        </div>
      ) : (
        <div className="space-y-6 overflow-y-auto pr-1 max-h-[600px] md:max-h-[700px]">
          {categories.map(category => (
            <div key={category} className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded transition-colors overflow-hidden">
              {/* Category Header */}
              <div className="bg-neutral-50 dark:bg-neutral-950 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {category}
                </span>
                <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                  {groupedItems[category].length} {groupedItems[category].length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items List */}
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-900">
                {groupedItems[category].map(item => (
                  <li
                    key={item.id}
                    className={`flex items-center justify-between px-4 py-3.5 transition-all ${
                      item.completed ? 'bg-neutral-50/50 dark:bg-neutral-950/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                      {/* Styled Checkbox */}
                      <button
                        onClick={() => onToggleComplete(item.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          item.completed
                            ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black'
                            : 'border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white'
                        }`}
                      >
                        {item.completed && (
                          <svg className="w-3.5 h-3.5 stroke-[3] stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>

                      {/* Item Details */}
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium tracking-tight truncate ${
                            item.completed
                              ? 'text-neutral-300 dark:text-neutral-700 line-through'
                              : 'text-neutral-900 dark:text-neutral-100'
                          }`}
                        >
                          {item.attributes && item.attributes.length > 0 && (
                            <span className="text-neutral-400 dark:text-neutral-500 mr-1.5 lowercase font-mono">
                              {item.attributes.join(' ')}
                            </span>
                          )}
                          {item.name}
                        </p>
                        
                        {/* Optional Info: Price & Unit */}
                        <div className="flex gap-2 mt-0.5">
                          {item.price !== undefined && (
                            <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                              ${item.price.toFixed(2)}
                            </span>
                          )}
                          {item.unit && (
                            <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                              ({item.unit})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Controls and Delete */}
                    <div className="flex items-center gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded bg-neutral-50 dark:bg-neutral-900 p-0.5">
                        <button
                          onClick={() => onDecrementQuantity(item.id)}
                          className="p-1 hover:text-black dark:hover:text-white text-neutral-400 dark:text-neutral-500 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onIncrementQuantity(item.id)}
                          className="p-1 hover:text-black dark:hover:text-white text-neutral-400 dark:text-neutral-500 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:text-neutral-600 dark:hover:text-neutral-100 transition-colors"
                        aria-label="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
