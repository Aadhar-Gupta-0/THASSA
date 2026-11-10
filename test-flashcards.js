const assert = require('node:assert/strict');
const {parseFlashcards, shuffledIndices} = require('./flashcards.js');
assert.deepEqual(parseFlashcards('A: B\nWrong line\nC: D: E'), [{question:'A',answer:'B'},{question:'C',answer:'D: E'}]);
assert.deepEqual(parseFlashcards(' : bad\nterm:'), []);
assert.deepEqual(parseFlashcards(null), []);
const order = shuffledIndices(5, () => 0.3);
assert.deepEqual(order.slice().sort(), [0,1,2,3,4]);
console.log('THASSA flashcard tests passed');
