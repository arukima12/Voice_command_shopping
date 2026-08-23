import { parseCommand } from './src/utils/nlpParser';

const testCases = [
  // English ADD
  { input: 'Add 2 bottles of organic milk', expectedIntent: 'ADD', expectedQty: 2, expectedUnit: 'bottles', expectedAttr: ['organic'], expectedItem: 'milk' },
  { input: 'I need 5 organic apples', expectedIntent: 'ADD', expectedQty: 5, expectedAttr: ['organic'], expectedItem: 'apples' },
  { input: 'bread', expectedIntent: 'ADD', expectedQty: undefined, expectedItem: 'bread' },
  
  // Spanish ADD
  { input: 'agregar 2 botellas de leche orgánica', expectedIntent: 'ADD', expectedQty: 2, expectedUnit: 'botellas', expectedAttr: ['orgánica'], expectedItem: 'leche' },
  { input: 'necesito tres manzanas frescas', expectedIntent: 'ADD', expectedQty: 3, expectedAttr: ['frescas'], expectedItem: 'manzanas' },
  
  // French ADD
  { input: 'ajouter 3 bouteilles de lait bio', expectedIntent: 'ADD', expectedQty: 3, expectedUnit: 'bouteilles', expectedAttr: ['bio'], expectedItem: 'lait' },
  
  // German ADD
  { input: 'füge zwei flaschen wasser hinzu', expectedIntent: 'ADD', expectedQty: 2, expectedUnit: 'flaschen', expectedItem: 'wasser' },
  
  // REMOVE
  { input: 'remove whole milk', expectedIntent: 'REMOVE', expectedItem: 'whole milk' },
  { input: 'quitar pan blanco', expectedIntent: 'REMOVE', expectedItem: 'pan' },
  
  // CHECK
  { input: 'check organic eggs', expectedIntent: 'CHECK', expectedItem: 'eggs' },
  { input: 'marcar leche', expectedIntent: 'CHECK', expectedItem: 'leche' },
  
  // SEARCH / FILTER
  { input: 'find items under $5', expectedIntent: 'SEARCH', expectedPriceUnder: 5 },
  { input: 'buscar bajo 10 dólares', expectedIntent: 'SEARCH', expectedPriceUnder: 10 },
  { input: 'find toothpaste under $3.50', expectedIntent: 'SEARCH', expectedItem: 'toothpaste', expectedPriceUnder: 3.50 }
];

console.log('--- RUNNING NLP PARSER TESTS ---');
let passed = 0;

testCases.forEach((tc, idx) => {
  const result = parseCommand(tc.input);
  const intentOk = result.intent === tc.expectedIntent;
  const qtyOk = result.quantity === tc.expectedQty;
  const unitOk = result.unit === tc.expectedUnit;
  const itemOk = tc.expectedItem ? result.itemName?.toLowerCase() === tc.expectedItem.toLowerCase() : true;
  const priceOk = tc.expectedPriceUnder ? result.priceConstraint?.value === tc.expectedPriceUnder : true;

  if (intentOk && qtyOk && unitOk && itemOk && priceOk) {
    passed++;
    console.log(`[PASS] Case #${idx + 1}: "${tc.input}"`);
  } else {
    console.log(`[FAIL] Case #${idx + 1}: "${tc.input}"`);
    console.log('  Expected:', { intent: tc.expectedIntent, qty: tc.expectedQty, unit: tc.expectedUnit, item: tc.expectedItem, priceUnder: tc.expectedPriceUnder });
    console.log('  Got:', { intent: result.intent, qty: result.quantity, unit: result.unit, item: result.itemName, priceUnder: result.priceConstraint?.value });
  }
});

console.log(`\nNLP Tests Completed: ${passed}/${testCases.length} Passed.`);
process.exit(passed === testCases.length ? 0 : 1);
