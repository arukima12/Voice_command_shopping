# Voice Command Shopping Assistant

An ultra-minimalist, editorial-style web application designed for hands-free shopping list management. Built with **Vite, React, TypeScript, and Tailwind CSS**, it features browser-native speech recognition paired with a custom client-side multilingual natural language processing (NLP) parser. 

No external server or paid API keys are required—all voice processing and intelligence operations run entirely client-side for maximum speed and privacy.

---

## Key Features

- **🎙️ Browser-Native Voice Input**: Powered by the Web Speech API (`webkitSpeechRecognition`), offering real-time transcript display and an animated waveform visualizer.
- **⌨️ Keyboard Fallback**: Accessible manual command input box that parses text queries using the exact same NLP engine.
- **🧠 Zero-Dependency NLP Parser**: Parses complex commands in **English, Spanish, French, and German** to extract:
  - **Intents**: `ADD`, `REMOVE`, `CHECK`, `UNCHECK`, `SEARCH`, `CLEAR`, `HELP`.
  - **Quantities & Units**: Detects numeric digits (e.g. `2`, `1.5`) and word representations (e.g., `two`, `tres`, `deux`, `zwei`) along with units (`bottles`, `paquetes`, `can`, `flasche`).
  - **Attributes**: Parses descriptors like `organic`, `fresh`, `blanco`, or `vegan` separate from the core item name.
  - **Price Constraints**: Filters search results on parameters like `under $5` or `sous 10 euros`.
- **✨ Context-Aware Smart Suggestions**:
  - **Frequent Reorders**: Suggests repurchasing items based on simulated usage intervals.
  - **Seasonal & Sales**: Offers contextual fresh produce recommendations.
  - **Healthy/Eco Substitutions**: Identifies items currently in the list and offers quick-swap alternatives (e.g. suggesting *Oat Milk* instead of *Whole Milk*).
- **📂 Automatic Categorization**: Automatically groups items into logical groups like *Produce*, *Dairy*, *Bakery*, *Pantry*, *Beverages*, and *Household*.
- **🌗 Editorial Theme System**: High-contrast minimalist design with full support for Light Mode, Dark Mode, and system-preference detection.

---

## Architectural Design

The application consists of lightweight, decoupled components:

```
[useSpeechRecognition.ts] (Audio Capture)
         │
         ▼ (Transcript Text)
   [nlpParser.ts] (Multilingual Token Parser)
         │
         ▼ (Intent + Entities)
       [App.tsx] (Main Controller & LocalStorage State)
         │
    ┌────┼────┐
    ▼    ▼    ▼
[VoiceControlPanel.tsx]  [ShoppingList.tsx]  [SuggestionsPanel.tsx]
 (Visual Feedback Wave)   (Grouped Categories) (Swap/Reorder Recommendations)
```

1. **`src/hooks/useSpeechRecognition.ts`**: Wrapper for `window.webkitSpeechRecognition`. Coordinates permissions, starts/stops recording sessions, and returns live interim results.
2. **`src/utils/nlpParser.ts`**: Normalizes punctuation (preserving decimals) and matches commands against localized regex dictionaries.
3. **`src/components/VoiceControlPanel.tsx`**: Renders command buttons, the audio wave indicator, the language selection controls, and the manual input box.
4. **`src/components/ShoppingList.tsx`**: Displays active items grouped by category, applies search filters, and exposes quantity increments.
5. **`src/components/SuggestionsPanel.tsx`**: Runs local evaluations to check if items qualify for swaps, reorders, or seasonal additions.

---

## Setup & Local Development

### 1. Install Dependencies
Make sure you have Node.js installed, then clone the project and install packages:
```bash
npm install
```

### 2. Run the Development Server
Launch Vite's hot-reloading development server locally:
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser (Google Chrome, Microsoft Edge, or Safari are recommended for Speech API compatibility).

### 3. Build for Production
Compile optimized static build assets:
```bash
npm run build
```
This output is saved to the `dist/` directory, ready to be hosted on Vercel, Netlify, or Firebase.

---

## Voice Command Reference Sheet

Here are examples of commands supported in different languages:

| Language | Action | Example Command | Extracted Target |
| :--- | :--- | :--- | :--- |
| **English** | **ADD** | *"Add 2 bottles of organic milk"* | Qty: `2`, Unit: `bottles`, Attr: `organic`, Item: `milk` |
| **English** | **REMOVE** | *"Remove whole milk"* | Item: `whole milk` |
| **English** | **SEARCH** | *"Find items under $5"* | Price Filter: `under 5.00` |
| **Spanish** | **ADD** | *"Agregar 2 botellas de leche orgánica"* | Qty: `2`, Unit: `botellas`, Attr: `orgánica`, Item: `leche` |
| **Spanish** | **REMOVE** | *"Quitar pan blanco"* | Attr: `blanco`, Item: `pan` |
| **Spanish** | **SEARCH** | *"Buscar bajo 10 dólares"* | Price Filter: `under 10.00` |
| **French** | **ADD** | *"Ajouter 3 bouteilles de lait bio"* | Qty: `3`, Unit: `bouteilles`, Attr: `bio`, Item: `lait` |
| **German** | **ADD** | *"Füge zwei flaschen wasser hinzu"* | Qty: `2`, Unit: `flaschen`, Item: `wasser` |
| **German** | **CHECK** | *"Abhaken Eier"* | Item: `eier` |
