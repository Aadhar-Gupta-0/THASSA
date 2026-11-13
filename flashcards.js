(function (root) {
  'use strict';
  function parseFlashcards(raw) {
    if (typeof raw !== 'string' || raw.length > 100 * 1024) return [];
    return raw.split(/\r?\n/).slice(0, 200).map(line => {
      const index = line.indexOf(':');
      if (index < 1) return null;
      const question = line.slice(0, index).trim();
      const answer = line.slice(index + 1).trim();
      return question && answer ? { question: question.slice(0, 200), answer: answer.slice(0, 1500) } : null;
    }).filter(Boolean);
  }
  function shuffledIndices(length, random = Math.random) {
    if (!Number.isSafeInteger(length) || length < 0 || length > 200) return [];
    const indices = Array.from({ length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const sample = Math.max(0, Math.min(0.999999999999, Number(random()) || 0));
      const j = Math.floor(sample * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }
  root.THASSA = { parseFlashcards, shuffledIndices };
  if (typeof module !== 'undefined') module.exports = root.THASSA;
})(typeof globalThis !== 'undefined' ? globalThis : this);
