'use strict';
const get = id => document.getElementById(id);
const DEFAULT_NOTES = "Photosynthesis: Plants convert sunlight into chemical energy.\nActive recall: Testing your memory helps strengthen learning.\nSpaced repetition: Revisiting information over time improves retention.";
let cards = [], order = [], position = 0, revealed = false;
let timerSeconds = 25 * 60, timerMode = 25, timerRunning = false, timerInterval = null;
function updateCards() {
  get('count').textContent = cards.length + (cards.length === 1 ? ' card' : ' cards');
  get('progress').textContent = cards.length ? (position + 1) + ' / ' + cards.length : '0 / 0';
  get('card-side').textContent = revealed ? 'ANSWER' : 'QUESTION';
  get('card-text').textContent = cards.length ? cards[order[position]][revealed ? 'answer' : 'question'] : 'Add notes on the left to begin.';
  get('card-hint').textContent = cards.length ? 'Click to ' + (revealed ? 'show question' : 'reveal answer') : 'Term: definition';
  for (const id of ['previous', 'next', 'shuffle', 'flashcard']) get(id).disabled = !cards.length;
}
function buildCards() {
  cards = THASSA.parseFlashcards(get('notes').value);
  order = cards.map((_, i) => i);
  position = 0; revealed = false; updateCards();
  if (!cards.length) get('card-text').textContent = 'Use one term: explanation per line.';
}
function rotateCards(step) { if (!cards.length) return; position = (position + step + cards.length) % cards.length; revealed = false; updateCards(); }
function shuffleCards() { if (!cards.length) return; order = THASSA.shuffledIndices(cards.length); position = 0; revealed = false; updateCards(); }
function safeSave() { try { localStorage.setItem('thassa-notes-v1', get('notes').value); } catch (_) {} }
function clockText(seconds) { return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0'); }
function updateClock() {
  get('clock').textContent = clockText(timerSeconds);
  get('timer-toggle').textContent = timerRunning ? 'Pause' : 'Start';
  document.title = timerRunning ? clockText(timerSeconds) + ' · THASSA' : 'THASSA — Study Studio';
}
function stopTimer() { if (timerInterval !== null) clearInterval(timerInterval); timerInterval = null; timerRunning = false; updateClock(); }
function resetTimer() { stopTimer(); timerSeconds = timerMode * 60; updateClock(); }
function chooseMode(minutes) {
  timerMode = minutes; resetTimer();
  get('focus-mode').classList.toggle('active', minutes === 25);
  get('break-mode').classList.toggle('active', minutes === 5);
}
function toggleTimer() {
  if (timerRunning) { stopTimer(); return; }
  timerRunning = true;
  const startedAt = Date.now();
  const initial = timerSeconds;
  timerInterval = setInterval(() => {
    timerSeconds = Math.max(0, initial - Math.floor((Date.now() - startedAt) / 1000));
    if (timerSeconds === 0) { stopTimer(); get('clock').textContent = '00:00'; }
    updateClock();
  }, 250);
  updateClock();
}
try { get('notes').value = localStorage.getItem('thassa-notes-v1') || DEFAULT_NOTES; } catch (_) { get('notes').value = DEFAULT_NOTES; }
get('notes').addEventListener('input', safeSave);
get('generate').addEventListener('click', buildCards);
get('clear').addEventListener('click', () => { get('notes').value = ''; safeSave(); buildCards(); });
get('flashcard').addEventListener('click', () => { if (cards.length) { revealed = !revealed; updateCards(); } });
get('next').addEventListener('click', () => rotateCards(1));
get('previous').addEventListener('click', () => rotateCards(-1));
get('shuffle').addEventListener('click', shuffleCards);
get('focus-mode').addEventListener('click', () => chooseMode(25));
get('break-mode').addEventListener('click', () => chooseMode(5));
get('timer-toggle').addEventListener('click', toggleTimer);
get('timer-reset').addEventListener('click', resetTimer);
document.addEventListener('keydown', event => {
  if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') return;
  if (event.key === 'ArrowRight') rotateCards(1);
  if (event.key === 'ArrowLeft') rotateCards(-1);
});
buildCards(); updateClock();

get('export').addEventListener('click', () => {
  const blob = new Blob([get('notes').value], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'thassa-flashcards.txt'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
});
get('import-file').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 100 * 1024) {
    alert('Import a plain-text notes file under 100 KB.');
    event.target.value = '';
    return;
  }
  const raw = await file.text();
  if (!THASSA.parseFlashcards(raw).length) {
    alert('No valid cards found. Use term: explanation lines.');
    event.target.value = '';
    return;
  }
  get('notes').value = raw;
  safeSave(); buildCards(); event.target.value = '';
});
