import { useState, useEffect } from 'react';
import { Sun, Moon, Volume2, RotateCcw } from 'lucide-react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { parseCommand, determineCategory } from './utils/nlpParser';
import { VoiceControlPanel } from './components/VoiceControlPanel';
import { ShoppingList } from './components/ShoppingList';
import type { ShoppingItem } from './components/ShoppingList';
import { SuggestionsPanel } from './components/SuggestionsPanel';

// Realistic price generator helper
function getRealisticPrice(name: string): number {
  const prices: Record<string, number> = {
    'milk': 3.89,
    'egg': 4.29,
    'eggs': 4.29,
    'bread': 4.99,
    'apple': 1.49,
    'apples': 2.99,
    'banana': 0.89,
    'bananas': 1.79,
    'water': 1.29,
    'coffee': 8.99,
    'tea': 3.49,
    'sugar': 2.29,
    'rice': 2.49,
    'pasta': 1.89,
    'tomato': 0.99,
    'tomatoes': 2.49,
    'avocado': 1.25,
    'avocados': 2.50,
    'butter': 3.99,
    'cheese': 4.49,
    'shampoo': 5.99,
    'toothpaste': 3.49,
    'soap': 1.99,
    'chips': 2.99,
    'chocolate': 2.49,
    'steak': 12.99,
    'chicken': 7.99,
    'salmon': 10.99
  };
  const key = name.toLowerCase().trim();
  for (const [k, p] of Object.entries(prices)) {
    if (key.includes(k)) return p;
  }
  // Fallback to a realistic price
  return parseFloat((1.50 + Math.random() * 5).toFixed(2));
}

// Initial demo list to guide the user's experience
const DEMO_ITEMS: ShoppingItem[] = [
  {
    id: '1',
    name: 'Sourdough Bread',
    quantity: 1,
    category: 'Bakery',
    completed: false,
    price: 4.99,
    addedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Organic Eggs (Dozen)',
    quantity: 1,
    attributes: ['organic'],
    category: 'Dairy',
    completed: false,
    price: 4.29,
    addedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Bananas',
    quantity: 3,
    category: 'Produce',
    completed: true,
    price: 1.79,
    addedAt: new Date().toISOString()
  }
];

export default function App() {
  // --- STATE ---
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<string>('en-US');
  const [filterText, setFilterText] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // --- PERSISTENCE ---
  useEffect(() => {
    // Load lists and settings from localStorage
    const savedItems = localStorage.getItem('shopping_items');
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (e) {
        console.error('Failed to parse shopping list', e);
        setItems(DEMO_ITEMS);
      }
    } else {
      setItems(DEMO_ITEMS);
    }

    const savedLang = localStorage.getItem('shopping_lang');
    if (savedLang) setActiveLanguage(savedLang);

    // Dark mode settings
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('shopping_theme');
    const isDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const saveItems = (newItems: ShoppingItem[]) => {
    setItems(newItems);
    localStorage.setItem('shopping_items', JSON.stringify(newItems));
  };

  // --- NOTIFICATION BANNER SYSTEM ---
  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    // Auto fade after 4 seconds
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  };

  // --- COMMAND INTERPRETER & EXECUTION ---
  const executeCommand = (text: string) => {
    if (!text.trim()) return;

    const parsed = parseCommand(text);
    console.log('Parsed speech command:', parsed);

    switch (parsed.intent) {
      case 'ADD': {
        if (!parsed.itemName) {
          showNotification('Could not understand item name.', 'error');
          break;
        }
        
        const existingIdx = items.findIndex(
          item => item.name.toLowerCase().trim() === parsed.itemName!.toLowerCase().trim()
        );

        if (existingIdx > -1) {
          // Increment quantity
          const updated = [...items];
          const qtyToAdd = parsed.quantity || 1;
          updated[existingIdx].quantity += qtyToAdd;
          saveItems(updated);
          showNotification(
            `Incremented ${updated[existingIdx].name} quantity by ${qtyToAdd}.`,
            'success'
          );
        } else {
          // Add new item
          const price = getRealisticPrice(parsed.itemName);
          const newItem: ShoppingItem = {
            id: Date.now().toString(),
            name: parsed.itemName.charAt(0).toUpperCase() + parsed.itemName.slice(1),
            quantity: parsed.quantity || 1,
            unit: parsed.unit,
            attributes: parsed.attributes,
            price,
            completed: false,
            category: parsed.category || determineCategory(parsed.itemName),
            addedAt: new Date().toISOString()
          };
          saveItems([newItem, ...items]);
          showNotification(`Added ${newItem.name} (${newItem.quantity}).`, 'success');
        }
        break;
      }

      case 'REMOVE': {
        const searchWords = [...(parsed.attributes || []), parsed.itemName].filter((w): w is string => !!w).map(w => w.toLowerCase());
        if (searchWords.length === 0) {
          showNotification('Could not understand item to remove.', 'error');
          break;
        }

        const initialLength = items.length;
        const filtered = items.filter(item => {
          const itemText = [...(item.attributes || []), item.name].filter(Boolean).join(' ').toLowerCase();
          const matchesAll = searchWords.every(word => itemText.includes(word));
          return !matchesAll;
        });

        if (filtered.length < initialLength) {
          const removedCount = initialLength - filtered.length;
          saveItems(filtered);
          showNotification(`Removed ${removedCount} matching item(s).`, 'success');
        } else {
          const searchStr = [...(parsed.attributes || []), parsed.itemName].filter(Boolean).join(' ');
          showNotification(`Could not find "${searchStr}" to remove.`, 'info');
        }
        break;
      }

      case 'CHECK': {
        const searchWords = [...(parsed.attributes || []), parsed.itemName].filter((w): w is string => !!w).map(w => w.toLowerCase());
        if (searchWords.length === 0) {
          showNotification('Could not understand item to check.', 'error');
          break;
        }

        const updated = items.map(item => {
          const itemText = [...(item.attributes || []), item.name].filter(Boolean).join(' ').toLowerCase();
          const matchesAll = searchWords.every(word => itemText.includes(word));
          if (matchesAll) {
            return { ...item, completed: true };
          }
          return item;
        });

        const checkedItems = updated.filter((item, idx) => item.completed && !items[idx].completed);
        
        if (checkedItems.length > 0) {
          saveItems(updated);
          showNotification(`Marked ${checkedItems.map(i => i.name).join(', ')} as completed.`, 'success');
        } else {
          const searchStr = [...(parsed.attributes || []), parsed.itemName].filter(Boolean).join(' ');
          showNotification(`Could not find uncompleted item matching "${searchStr}".`, 'info');
        }
        break;
      }

      case 'UNCHECK': {
        const searchWords = [...(parsed.attributes || []), parsed.itemName].filter((w): w is string => !!w).map(w => w.toLowerCase());
        if (searchWords.length === 0) {
          showNotification('Could not understand item to uncheck.', 'error');
          break;
        }

        const updated = items.map(item => {
          const itemText = [...(item.attributes || []), item.name].filter(Boolean).join(' ').toLowerCase();
          const matchesAll = searchWords.every(word => itemText.includes(word));
          if (matchesAll) {
            return { ...item, completed: false };
          }
          return item;
        });

        const uncheckedItems = updated.filter((item, idx) => !item.completed && items[idx].completed);

        if (uncheckedItems.length > 0) {
          saveItems(updated);
          showNotification(`Reopened ${uncheckedItems.map(i => i.name).join(', ')}.`, 'success');
        } else {
          const searchStr = [...(parsed.attributes || []), parsed.itemName].filter(Boolean).join(' ');
          showNotification(`Could not find completed item matching "${searchStr}".`, 'info');
        }
        break;
      }

      case 'SEARCH': {
        // Set search criteria
        if (parsed.itemName) {
          setFilterText(parsed.itemName);
        }
        if (parsed.priceConstraint) {
          setPriceFilter(parsed.priceConstraint.value);
        }
        showNotification(
          `Filters applied: ${parsed.itemName ? `"${parsed.itemName}"` : ''} ${
            parsed.priceConstraint ? `under $${parsed.priceConstraint.value}` : ''
          }`,
          'info'
        );
        break;
      }

      case 'CLEAR': {
        saveItems([]);
        showNotification('Shopping list cleared.', 'info');
        break;
      }

      case 'HELP': {
        // VoiceCommandGuide handles help state in overlay panel, but trigger feedback
        showNotification('Showing voice command guide.', 'info');
        break;
      }

      default: {
        showNotification(`Command recognized but action is not clear: "${text}"`, 'info');
        break;
      }
    }
  };

  // --- SPEECH RECOGNITION HOOK ---
  const {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    error: speechError
  } = useSpeechRecognition((result) => {
    executeCommand(result);
  });

  // --- INTERACTION HANDLERS ---
  const handleToggleComplete = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveItems(updated);
  };

  const handleIncrementQuantity = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    saveItems(updated);
  };

  const handleDecrementQuantity = (id: string) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const nextQty = item.quantity - 1;
        return nextQty > 0 ? { ...item, quantity: nextQty } : item;
      }
      return item;
    });
    saveItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    const target = items.find(item => item.id === id);
    const updated = items.filter(item => item.id !== id);
    saveItems(updated);
    if (target) {
      showNotification(`Removed ${target.name}.`, 'info');
    }
  };

  const handleClearFilters = () => {
    setFilterText('');
    setPriceFilter(null);
    showNotification('Search filters cleared.', 'info');
  };

  const handleLanguageChange = (langCode: string) => {
    setActiveLanguage(langCode);
    localStorage.setItem('shopping_lang', langCode);
    showNotification(`Language set to ${langCode === 'es-ES' ? 'Spanish' : langCode === 'fr-FR' ? 'French' : langCode === 'de-DE' ? 'German' : 'English'}.`, 'info');
  };

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    localStorage.setItem('shopping_theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  const handleAddSuggestion = (name: string, category: string, price?: number) => {
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name,
      quantity: 1,
      price,
      completed: false,
      category,
      addedAt: new Date().toISOString()
    };
    saveItems([newItem, ...items]);
    showNotification(`Added ${name} to list.`, 'success');
  };

  const handleSwapItem = (originalId: string, name: string, category: string, price?: number) => {
    const original = items.find(item => item.id === originalId);
    if (!original) return;

    const updated = items.map(item => {
      if (item.id === originalId) {
        return {
          ...item,
          name,
          category,
          price,
          attributes: undefined // clear old attributes
        };
      }
      return item;
    });
    saveItems(updated);
    showNotification(`Swapped ${original.name} for ${name}.`, 'success');
  };

  const handleResetDemo = () => {
    saveItems(DEMO_ITEMS);
    setFilterText('');
    setPriceFilter(null);
    showNotification('Reset to initial demo list.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#070707] text-[#111111] dark:text-[#f3f3f3] transition-colors duration-200">
      {/* Editorial Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black px-6 py-6 md:px-12 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
            <h1 className="text-sm font-mono font-bold tracking-[0.2em] uppercase select-none">
              LIST / ASSISTANT
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetDemo}
              title="Reset list data"
              className="p-2 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white rounded transition-colors text-neutral-400 hover:text-black dark:hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white rounded transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Confirmation Toast Notification */}
      {notification && (
        <div className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black px-6 py-3 transition-all duration-300 animate-slideDown">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${
              notification.type === 'success'
                ? 'bg-neutral-900 dark:bg-neutral-100'
                : notification.type === 'error'
                ? 'bg-neutral-500'
                : 'bg-neutral-300'
            }`}></span>
            <span className="uppercase text-neutral-400 mr-2">{notification.type}:</span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <main className="max-w-7xl mx-auto px-6 py-10 md:px-12">
        {/* Browser support warning */}
        {!isSupported && (
          <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 mb-8 text-center text-xs font-mono rounded">
            <p className="text-neutral-500 dark:text-neutral-400">
              Web Speech API is not supported in this browser. Please use the manual command input at the bottom of the voice panel.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Voice Commands & Smart Suggestions (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <VoiceControlPanel
              isListening={isListening}
              transcript={transcript}
              error={speechError}
              activeLanguage={activeLanguage}
              onLanguageChange={handleLanguageChange}
              onStartListening={() => startListening(activeLanguage)}
              onStopListening={stopListening}
              onManualSubmit={executeCommand}
            />

            <SuggestionsPanel
              shoppingItems={items}
              onAddSuggestion={handleAddSuggestion}
              onSwapItem={handleSwapItem}
            />
          </div>

          {/* Right Column: The Shopping List (7 columns) */}
          <div className="lg:col-span-7 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded transition-colors">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100 dark:border-neutral-900">
              <h2 className="text-xs font-mono font-bold tracking-widest text-neutral-900 dark:text-neutral-100 uppercase">
                Shopping List
              </h2>
              <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                {items.filter(i => !i.completed).length} active / {items.length} total
              </span>
            </div>

            <ShoppingList
              items={items}
              filterText={filterText}
              priceFilter={priceFilter}
              onToggleComplete={handleToggleComplete}
              onIncrementQuantity={handleIncrementQuantity}
              onDecrementQuantity={handleDecrementQuantity}
              onDeleteItem={handleDeleteItem}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>
      </main>

      {/* Styled css injected for notifications */}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
