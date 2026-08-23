# Architectural Approach

This production-ready, hands-free shopping assistant runs entirely client-side to ensure zero-latency processing and absolute user privacy.

1. **Voice Input Wrapper (`useSpeechRecognition.ts`)**: Hooks into the browser's native Web Speech API (`webkitSpeechRecognition`). Manages continuous recording states, microphone permissions, and real-time interim output text.
2. **Multilingual NLP Engine (`nlpParser.ts`)**: Analyzes text transcripts in English, Spanish, French, and German. Standardizes punctuation while keeping decimal points intact. Extracts intents (`ADD`, `REMOVE`, `CHECK`, `UNCHECK`, `SEARCH`, `CLEAR`, `HELP`), item names, quantities, units, attributes, and price constraints.
3. **Smart Suggestions Catalog (`mockData.ts`)**: Models historical repurchase intervals, extracts seasonal items, and provides contextual swaps (e.g. plant-based alternative swaps).
4. **App Logic (`App.tsx`)**: Integrates state handling, updates `localStorage`, handles the responsive grid layout, manages light/dark mode toggling, and dispatches success confirmation notifications.

This client-side modular flow delivers an accessible, mobile-first, and highly utility-focused design with zero database or paid API key dependencies.
