const games = [
  { id: 'memory', name: 'Memory Meadow', type: 'Memory', desc: 'Find the pairs hidden in the meadow.', color: 'memory', skill: 'Memory', tip: 'Turn over two cards at a time and remember where each object lives.', instruction: ['Look closely at every card.', 'Turn over two cards to make a pair.', 'Clear all four pairs to earn points.'] },
  { id: 'numbers', name: 'Number Sprint', type: 'Speed', desc: 'Spot the one number that does not belong.', color: 'numbers', skill: 'Processing speed', tip: 'Trust your first careful scan—one number follows a different rule.', instruction: ['Read the numbers from left to right.', 'Find the only odd number.', 'Choose it before the next round.'] },
  { id: 'focus', name: 'Focus Flow', type: 'Attention', desc: 'Follow the spark and stay present.', color: 'focus', skill: 'Attention', tip: 'Keep your eyes on the orange spark. One tap at a time is enough.', instruction: ['Find the orange spark.', 'Tap it when it appears.', 'Collect five sparks without rushing.'] },
  { id: 'words', name: 'Word Weave', type: 'Language', desc: 'Complete a phrase with the right word.', color: 'words', skill: 'Language', tip: 'Read the whole sentence before you choose the word that feels natural.', instruction: ['Read the phrase carefully.', 'Compare all three endings.', 'Choose the word that completes it.'] },
  { id: 'patterns', name: 'Pattern Path', type: 'Logic', desc: 'Follow the pattern to its next step.', color: 'patterns', skill: 'Reasoning', tip: 'Notice what changes and what stays the same before choosing.', instruction: ['Look for the repeating rule.', 'Predict the next shape.', 'Choose the matching answer.'] },
  { id: 'spatial', name: 'Spatial Studio', type: 'Spatial', desc: 'Rotate a shape in your mind.', color: 'spatial', skill: 'Spatial skills', tip: 'Imagine turning the shape clockwise before you decide.', instruction: ['Study the reference shape.', 'Picture it after a turn.', 'Choose the matching shape.'] }
];

let route = 'home', assessmentStep = 0, assessmentAnswers = ['female', '36', 'none', '20 min'], activeGame = null;
let points = Number(localStorage.getItem('mind-plus-points') || 1200);
let cognitiveScore = Number(localStorage.getItem('mind-plus-score') || 82);
let skills = JSON.parse(localStorage.getItem('mind-plus-skills') || '{"Memory":78,"Attention":72,"Processing speed":69,"Language":75,"Reasoning":70,"Spatial skills":66}');
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const esc = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

function persist() {
  localStorage.setItem('mind-plus-points', points);
  localStorage.setItem('mind-plus-score', cognitiveScore);
  localStorage.setItem('mind-plus-skills', JSON.stringify(skills));
}
function skillSummary() {
  const rows = Object.entries(skills);
  const strongest = [...rows].sort((a, b) => b[1] - a[1])[0];
  return `<div class="skills-heading"><div><span class="eyebrow">Your progress</span><h2>Cognitive skills</h2></div><strong>${cognitiveScore}<small>/100</small></strong></div><p>Strongest today: <b>${esc(strongest[0])}</b></p><div class="skill-bars">${rows.map(([name, value]) => `<div class="skill-row"><span>${esc(name)}</span><i><b style="width:${value}%"></b></i><em>${value}</em></div>`).join('')}</div>`;
}
function updateProgressUi() {
  $$('#points').forEach(element => element.textContent = points.toLocaleString('en-US'));
  if ($('#score')) $('#score').textContent = cognitiveScore;
  if ($('#skillsSummary')) $('#skillsSummary').innerHTML = skillSummary();
}
function gameCard(game, store = false) {
  const index = games.indexOf(game);
  return store
    ? `<button class="store-tile ${game.color}" data-game="${game.id}" aria-label="Open ${esc(game.name)}"><img src="assets/home-art-${4 + index}.png" alt="" /><span class="tile-number">${String(index + 1).padStart(2, '0')} · ${esc(game.type)}</span><h2>${esc(game.name)}</h2><p>${esc(game.desc)}</p><span class="tile-play">Play</span></button>`
    : `<button class="figma-game-card ${game.color}" data-game="${game.id}" aria-label="Open ${esc(game.name)}"><img src="assets/home-art-${4 + index}.png" alt="" /><strong>${esc(game.name)}</strong><small>${esc(game.type)} · <b>+50 pts</b></small><span class="play">▶</span></button>`;
}
function drawGames() {
  $('#quickGames').innerHTML = `<img src="assets/figma-games.png" alt="Memory Sequence, Mental Math, Focus Flow, Pattern Match, Word Grid and Spatial Blocks games" />${games.map(game => `<button class="game-hotspot" data-game="${game.id}" aria-label="Open ${esc(game.name)}"></button>`).join('')}`;
  $('#storeGames').innerHTML = games.map(game => gameCard(game, true)).join('');
  updateProgressUi();
}
function enableRailDragging() {
  $$('.figma-game-scroller.image-games, .figma-program-row.image-programs').forEach(rail => {
    let startX = 0, startScroll = 0, dragging = false;
    rail.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch') return;
      dragging = true; startX = event.clientX; startScroll = rail.scrollLeft;
      rail.classList.add('is-dragging'); rail.setPointerCapture(event.pointerId);
    });
    rail.addEventListener('pointermove', event => {
      if (!dragging) return;
      rail.scrollLeft = startScroll - (event.clientX - startX);
    });
    const stop = () => { dragging = false; rail.classList.remove('is-dragging'); };
    rail.addEventListener('pointerup', stop);
    rail.addEventListener('pointercancel', stop);
    rail.addEventListener('lostpointercapture', stop);
  });
}
function setRoute(next) {
  route = next;
  $$('.view').forEach(view => view.classList.toggle('active', view.id === next));
  $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.route === next));
  if (next === 'assessment') renderAssessment();
  if (next === 'game') renderGamePage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function toast(message) {
  const element = $('#toast'); element.textContent = message; element.classList.add('show');
  setTimeout(() => element.classList.remove('show'), 2400);
}
function renderAssessment() {
  const data = [
    { q: 'About you', p: 'This helps us personalise your experience.', opts: [['female', 'Female'], ['male', 'Male'], ['non-binary', 'Non binary'], ['not-say', 'Prefer not to say']] },
    { q: 'How old are you?', p: 'We use your age to compare results with people in a similar age group.', age: true },
    { q: 'Accessibility preferences', p: 'Choose anything that makes your experience more comfortable.', opts: [['larger-text', 'Larger text'], ['reduced-motion', 'Reduced motion'], ['high-contrast', 'High contrast'], ['none', 'None']] },
    { q: 'Daily practice', p: 'A little consistency goes a long way.', opts: [['5 min', '5 minutes'], ['10 min', '10 minutes'], ['15 min', '15 minutes'], ['20 min', '20 minutes']] }
  ];
  const current = data[assessmentStep];
  $('#stepLabel').textContent = `Step ${assessmentStep + 1} of 4`;
  $('#progressBar').style.width = `${(assessmentStep + 1) * 25}%`;
  $('#backBtn').disabled = assessmentStep === 0;
  $('#nextBtn').innerHTML = assessmentStep === 3 ? 'Complete <span>✓</span>' : 'Next <span>→</span>';
  const options = current.age
    ? `<div class="age-picker">${[34, 35, 36, 37, 38, 39].map(age => `<button class="${assessmentAnswers[1] === String(age) ? 'selected' : ''}" data-choice="${age}">${age}</button>`).join('')}</div>`
    : `<div class="choices">${current.opts.map(([value, label]) => `<button class="choice ${assessmentAnswers[assessmentStep] === value ? 'selected' : ''}" data-choice="${value}">${label}</button>`).join('')}</div>`;
  $('#assessmentContent').innerHTML = `<div class="question"><h1>${current.q}</h1><p>${current.p}</p>${options}</div>`;
}
function renderGamePage() {
  if (!activeGame) { setRoute('store'); return; }
  const index = games.indexOf(activeGame);
  $('#gamePageContent').innerHTML = `<article class="game-intro ${activeGame.color}"><div class="game-cover"><img src="assets/home-art-${4 + index}.png" alt="3D artwork for ${esc(activeGame.name)}" /></div><div class="game-intro-copy"><span class="eyebrow">${esc(activeGame.type)} · +50 points</span><h1>${esc(activeGame.name)}</h1><p>${esc(activeGame.desc)}</p><div class="game-skill-badge">Trains <b>${esc(activeGame.skill)}</b></div></div></article><section class="how-to-play"><span class="eyebrow">Before you begin</span><h2>How to play</h2><p class="game-tip">${esc(activeGame.tip)}</p><ol>${activeGame.instruction.map((step, number) => `<li><span>${number + 1}</span>${esc(step)}</li>`).join('')}</ol><button class="primary start-game" id="startGame">Start game <span>→</span></button></section><section class="game-run" id="gameRun" hidden></section>`;
}
function finishGame(reward) {
  points += reward;
  skills[activeGame.skill] = Math.min(99, skills[activeGame.skill] + Math.max(1, Math.round(reward / 6)));
  cognitiveScore = Math.min(99, Math.round(Object.values(skills).reduce((sum, value) => sum + value, 0) / Object.keys(skills).length));
  persist(); updateProgressUi();
  $('.game-status').innerHTML = `Great work — <b>+${reward} points</b> added to your score.`;
  $('#gameRun').insertAdjacentHTML('beforeend', '<button class="secondary full" data-route="home">See your cognitive skills</button>');
}
function buildGame(area) {
  if (activeGame.id === 'memory') {
    const values = ['🍐', '🍐', '🌿', '🌿', '☁️', '☁️', '🌼', '🌼']; values.sort(() => Math.random() - 0.5);
    let open = [], matched = 0;
    area.innerHTML = `<p class="game-status">Find the four matching pairs.</p><div class="game-board">${values.map((value, index) => `<button class="game-square" data-value="${value}" data-index="${index}" aria-label="Hidden card">?</button>`).join('')}</div>`;
    $$('.game-square').forEach(button => button.onclick = () => {
      if (button.classList.contains('flipped') || button.classList.contains('matched') || open.length === 2) return;
      button.textContent = button.dataset.value; button.classList.add('flipped'); open.push(button);
      if (open.length !== 2) return;
      if (open[0].dataset.value === open[1].dataset.value) {
        open.forEach(card => card.classList.replace('flipped', 'matched')); open = []; matched += 1;
        if (matched === 4) finishGame(50);
      } else setTimeout(() => { open.forEach(card => { card.textContent = '?'; card.classList.remove('flipped'); }); open = []; }, 650);
    });
    return;
  }
  if (activeGame.id === 'focus') {
    area.innerHTML = '<p class="game-status">Tap the orange spark five times.</p><div class="focus-arena"><button class="focus-dot" aria-label="Tap the spark">✦</button></div>';
    let count = 0;
    const place = () => { const button = $('.focus-dot'); button.style.left = `${10 + Math.random() * 70}%`; button.style.top = `${10 + Math.random() * 65}%`; button.onclick = () => { count += 1; if (count === 5) { button.style.display = 'none'; finishGame(50); } else place(); }; };
    place(); return;
  }
  if (activeGame.id === 'words') {
    area.innerHTML = '<p class="game-status">Which word completes the phrase?</p><div class="word-list"><button class="word-option" data-ok="0">Still waters run loud.</button><button class="word-option" data-ok="1">Still waters run deep.</button><button class="word-option" data-ok="0">Still waters run quick.</button></div>';
    $$('.word-option').forEach(button => button.onclick = () => { button.classList.add(button.dataset.ok === '1' ? 'correct' : 'wrong'); if (button.dataset.ok === '1') finishGame(50); });
    return;
  }
  const numbers = activeGame.id === 'numbers', patterns = activeGame.id === 'patterns';
  const options = numbers ? ['24', '36', '57', '48'] : patterns ? ['●', '▲', '●', '■'] : ['▤', '▥', '▧', '▦'];
  const answer = numbers ? 2 : patterns ? 0 : 3;
  const prompt = numbers ? 'Tap the only odd number.' : patterns ? 'Choose the next shape in the pattern.' : 'Choose the shape that matches after a turn.';
  area.innerHTML = `<p class="game-status">${prompt}</p><div class="sequence">${options.map((option, index) => `<button data-ok="${index === answer ? '1' : '0'}">${option}</button>`).join('')}</div>`;
  $$('.sequence button').forEach(button => button.onclick = () => { if (button.dataset.ok === '1') { button.classList.add('target'); finishGame(50); } else $('.game-status').textContent = 'Almost. Look once more, then try again.'; });
}
function startGame() {
  const area = $('#gameRun'); area.hidden = false; $('.how-to-play').hidden = true; buildGame(area); window.scrollTo({ top: 0, behavior: 'smooth' });
}
function choose(value) { assessmentAnswers[assessmentStep] = value; renderAssessment(); }
function openGame(id) { activeGame = games.find(game => game.id === id); setRoute('game'); }
document.addEventListener('click', event => {
  const scoreToggle = event.target.closest('[data-score-toggle]');
  if (scoreToggle) {
    const homeTop = document.querySelector('.figma-home-top');
    const expanded = homeTop.classList.toggle('score-expanded');
    scoreToggle.setAttribute('aria-expanded', String(expanded));
    return;
  }
  const skillsButton = event.target.closest('[data-scroll-skills]');
  if (skillsButton) {
    setRoute('home');
    return;
  }
  const routeButton = event.target.closest('[data-route]'); if (routeButton) { setRoute(routeButton.dataset.route); return; }
  const gameButton = event.target.closest('[data-game]'); if (gameButton) { openGame(gameButton.dataset.game); return; }
  const choice = event.target.closest('[data-choice]'); if (choice) { choose(choice.dataset.choice); return; }
  if (event.target.closest('#startGame')) { startGame(); return; }
  if (event.target.closest('[data-demo]')) toast('Profile is coming soon in this demo.');
});
$('#nextBtn').onclick = () => { if (assessmentStep < 3) { assessmentStep += 1; renderAssessment(); } else { cognitiveScore = Math.min(99, cognitiveScore + 3); persist(); updateProgressUi(); setRoute('home'); toast('Your personalised plan is ready.'); } };
$('#backBtn').onclick = () => { if (assessmentStep) { assessmentStep -= 1; renderAssessment(); } };
drawGames();
enableRailDragging();
