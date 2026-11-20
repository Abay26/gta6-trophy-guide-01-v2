// Vice Ledger — GTA VI trophy guide & tracker.
// Boot, views (checklist / roadmap / missables / collectibles), filters, progress
// and deep links. Progress lives in tracker.js; the detail panel in detail.js.
import { loadStored, saveStored, exportFile, importFile } from './tracker.js';
import { renderDetail, gradeBadge, kindLabel, difficultyDots } from './detail.js';

const params = new URLSearchParams(location.search);
const rowsEl = document.getElementById('rows');
const detailEl = document.getElementById('detail');

let trophies = [];
let earned = loadStored();
let selectedId = null;
let view = 'checklist';

// Roadmap phases, built from the official descriptions: story first, then the
// stranger strands, then activities and combat, then collectibles and the long
// grind, then the platinum. Each phase lists the trophy ids it covers.
const PHASES = [
  { n: 1, title: 'Story — Chapters 1–4 and the finale', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 48],
    text: 'Play the story in order: the opening mission Gone Fishing, then Chapters 1–4 and the final mission, plus the named missions Breakfast Run, The Cartel Heist, Child’s Play, Headliners, VCIA Takedown and Operation Savage Glory. Story trophies pop as you finish them and cannot be missed.' },
  { n: 2, title: 'Strangers & side stories — finish the five chains', ids: [22, 23, 24, 25, 26, 27],
    text: 'Complete the final mission for each stranger — Andy, Kenton, Billy, Randy and Tyrone — and all 8 stranger strands for Strangers & Freaks. Published guides report these chains have windows tied to story progress, so do them while the story is still open rather than leaving them for free roam.' },
  { n: 3, title: 'Activities & combat — the open-world feats', ids: [15, 16, 17, 18, 19, 20, 21, 28, 29, 32, 33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 49, 50, 51, 52, 53],
    text: 'Stunts, races, the Shooting Range, drone races, fishing, arcade games, meditation, hunting, challenges, partner robberies and combat feats. Do the one possibly missable trophy — Positive Mental Attitude — here, and do it early: its first meditation is in Chapter 1.' },
  { n: 4, title: 'Collectibles & the long grind — toward 100%', ids: [14, 30, 31, 35, 42, 54, 55],
    text: 'Card sets, WAiNK locations, vehicles, exploration, garages and registrations, all building toward the 100% completion checklist (A Long Road). The checklist itself only appears after the story, under Progress > Stats > 100% Completion, but everything you do before then already counts.' },
  { n: 5, title: 'Platinum — Vice Got a Price!', ids: [1],
    text: 'Earn the other 54 trophies and the platinum unlocks automatically. When the progress bar reads 54 / 55, one trophy is left — find it in the checklist.' },
];

// Collectible sets the 100% checklist tracks, as launch guides count them
// (PowerPyx, GTABase, Nov 2026). Shown in the Collectibles view with the
// trophy each set feeds.
const COLLECTIBLES = [
  { name: 'Collectible cards', total: '480 cards in 18 sets', need: '15 sets for 100% · 3 sets for Don’t Touch My Deck', trophy: 30 },
  { name: 'Meditation spots', total: '18 quiet spots across Leonida', need: '15 for 100% · all 18 for Positive Mental Attitude', trophy: 28 },
  { name: 'Vehicles to discover', total: '277 vehicles in the game', need: '200 for 100% · 100 for Whip It Good', trophy: 35 },
  { name: 'Stunts', total: '397 stunts', need: '300 for 100% · 250 for Cunning Stunts', trophy: 15 },
  { name: 'Challenges', total: '80 challenges', need: '70 for 100% · 50 for One Last Thing', trophy: 32 },
  { name: 'Unique races', total: '40 unique races', need: '30 won for 100% · 20 for Earn Cash, Not Kudos', trophy: 19 },
  { name: 'Shooting Range golds', total: '42 challenges, two ranges', need: '42 of 42 for 100% and for The Shootist', trophy: 17 },
  { name: 'Drone time trials', total: '42 trials at 14 Top Fun locations', need: '42 of 42 for 100% · 1 win per location for Top Fun', trophy: 18 },
  { name: 'Underwater discoveries', total: '33 discoveries', need: 'All 33 for 100%', trophy: 42 },
  { name: 'Magazines, books & comics', total: '34 items', need: '30 for 100%', trophy: 30 },
  { name: 'Kenton’s treasure sets', total: '7 sets', need: '5 for 100%', trophy: 23 },
  { name: 'Cocaine flamingos', total: '125 flamingos', need: '100 for 100%', trophy: 42 },
];

function spoilerOn() {
  return document.getElementById('spoiler').checked;
}

function displayName(t) {
  if (spoilerOn() && t.kind === 'story' && !earned.has(t.name)) return 'Hidden story trophy — earn it to reveal';
  return t.name;
}

function displayDesc(t) {
  if (spoilerOn() && t.kind === 'story' && !earned.has(t.name)) return 'Hidden until earned (spoiler-safe mode is on).';
  return t.description;
}

function byId(id) {
  return trophies.find((t) => t.id === id);
}

function filtered() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const kind = document.getElementById('kind').value;
  const grade = document.getElementById('grade').value;
  const hideEarned = document.getElementById('hideEarned').checked;
  let list = trophies;
  if (view === 'missables') list = list.filter((t) => t.missable || t.timeSensitive);
  if (view === 'collectibles') list = list.filter((t) => t.kind === 'collectible' || t.kind === 'exploration');
  if (kind !== 'all') list = list.filter((t) => t.kind === kind);
  if (grade !== 'all') list = list.filter((t) => t.grade === grade);
  if (hideEarned) list = list.filter((t) => !earned.has(t.name));
  if (q) {
    list = list.filter((t) =>
      [t.name, t.description, t.guide, t.kind, (t.steps || []).join(' ')].join(' ').toLowerCase().includes(q));
  }
  return list;
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  document.getElementById('progressBig').textContent = `${done} / ${total}`;
  document.getElementById('progressFill').style.width = total ? `${(done / total) * 100}%` : '0%';
  document.getElementById('progressText').textContent =
    `${done} earned · ${total - done} to go · ${total ? Math.round((done / total) * 100) : 0}%`;
  const byGrade = (g) => trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
  const counts = (g) => trophies.filter((t) => t.grade === g).length;
  document.getElementById('gradeLine').textContent =
    `Platinum ${byGrade('platinum')}/${counts('platinum')} · Gold ${byGrade('gold')}/${counts('gold')} · Silver ${byGrade('silver')}/${counts('silver')} · Bronze ${byGrade('bronze')}/${counts('bronze')}`;
  const order = [...trophies].sort((a, b) => a.stage - b.stage || a.id - b.id);
  const next = order.find((t) => !earned.has(t.name));
  const nextEl = document.getElementById('nextUp');
  nextEl.replaceChildren();
  if (next) {
    nextEl.append(document.createTextNode('Next up: '));
    const strong = document.createElement('strong');
    strong.textContent = displayName(next);
    nextEl.append(strong, document.createTextNode(` — ${next.when || 'roadmap phase ' + next.stage}`));
  } else if (total) {
    nextEl.textContent = 'All 55 earned — the platinum is yours.';
  }
}

function renderRows() {
  const list = filtered();
  rowsEl.replaceChildren();
  for (const t of list) {
    const tr = document.createElement('tr');
    if (selectedId === t.id) tr.classList.add('selected');
    if (earned.has(t.name)) tr.classList.add('earned-row');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name); else earned.delete(t.name);
      saveStored(earned);
      renderAll();
    });
    const tdBox = document.createElement('td');
    tdBox.append(box);
    const tdName = document.createElement('td');
    const nameStrong = document.createElement('strong');
    nameStrong.className = 'trophy-name';
    nameStrong.textContent = displayName(t);
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = displayDesc(t);
    tdName.append(nameStrong, desc);
    if (t.missable) {
      const flag = document.createElement('span');
      flag.className = 'flag missable';
      flag.textContent = 'MISSABLE';
      tdName.append(flag);
    }
    if (t.timeSensitive) {
      const flag = document.createElement('span');
      flag.className = 'flag watch';
      flag.textContent = 'TIME-SENSITIVE';
      tdName.append(flag);
    }
    const tdGrade = document.createElement('td');
    tdGrade.append(gradeBadge(t.grade));
    const tdKind = document.createElement('td');
    const kind = document.createElement('span');
    kind.className = 'kind-tag';
    kind.textContent = kindLabel(t.kind);
    tdKind.append(kind);
    const tdTime = document.createElement('td');
    const time = document.createElement('div');
    time.className = 'time-est';
    time.textContent = t.time || '';
    const dots = document.createElement('div');
    dots.className = 'diff-dots';
    dots.textContent = difficultyDots(t.difficulty);
    tdTime.append(time, dots);
    tr.append(tdBox, tdName, tdGrade, tdKind, tdTime);
    tr.addEventListener('click', (e) => {
      if (e.target === box) return;
      selectedId = t.id;
      renderAll();
    });
    rowsEl.append(tr);
  }
  document.getElementById('emptyMsg').hidden = list.length > 0;
  const viewLabel = view === 'missables' ? ' — missable & time-sensitive only'
    : view === 'collectibles' ? ' — collectibles & exploration only' : '';
  document.getElementById('resultCount').textContent =
    `Showing ${list.length} of ${trophies.length} trophies${viewLabel}` +
    (spoilerOn() ? ' · spoiler-safe on: story names hidden until earned' : '');
}

function renderRoadmap() {
  const ol = document.getElementById('phases');
  ol.replaceChildren();
  for (const p of PHASES) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = `Phase ${p.n} — ${p.title}`;
    const para = document.createElement('p');
    para.textContent = p.text;
    const inPhase = p.ids.map(byId).filter(Boolean);
    const done = inPhase.filter((t) => earned.has(t.name)).length;
    const count = document.createElement('p');
    count.className = 'phase-count';
    count.textContent = `${done} / ${inPhase.length} trophies in this phase earned` +
      (inPhase.some((t) => t.missable) ? ` · includes ${inPhase.filter((t) => t.missable).length} missable` : '') +
      (inPhase.some((t) => t.timeSensitive) ? ` · includes ${inPhase.filter((t) => t.timeSensitive).length} time-sensitive` : '');
    const chips = document.createElement('div');
    chips.className = 'phase-chips';
    for (const t of inPhase) {
      const chip = document.createElement('span');
      chip.className = 'chip' + (earned.has(t.name) ? ' done' : '') + (t.missable ? ' miss' : '');
      chip.textContent = displayName(t);
      chips.append(chip);
    }
    li.append(h, para, count, chips);
    ol.append(li);
  }
}

function renderMissables() {
  const missable = trophies.filter((t) => t.missable);
  const card = document.getElementById('missableCard');
  card.replaceChildren();
  if (missable.length) {
    const t = missable[0];
    const h = document.createElement('h2');
    h.textContent = `The one possibly missable trophy: ${t.name}`;
    const p1 = document.createElement('p');
    p1.textContent = t.missableNote || '';
    const p2 = document.createElement('p');
    p2.textContent = 'Published launch guides (GTABase, PowerPyx, KeenGamer) agree: this is the only trophy flagged as possibly missable. Everything else can be finished in free roam after the story — but do this one early, in Chapter 1, to be safe.';
    const p3 = document.createElement('p');
    p3.textContent = 'Open its guide in the detail panel for the full method and its sources.';
    card.append(h, p1, p2, p3);
  }
  const watch = document.getElementById('watchList');
  watch.replaceChildren();
  for (const t of trophies.filter((x) => x.timeSensitive)) {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = t.name;
    li.append(strong, document.createTextNode(` — ${t.timeSensitiveNote || ''}`));
    watch.append(li);
  }
  document.getElementById('safeNote').textContent =
    'Everything else is safe after the story: launch guides agree nothing on the 100% completion checklist is missable, and every other trophy can be earned in free roam once the credits roll.';
}

function renderCollectibles() {
  const grid = document.getElementById('collectGrid');
  grid.replaceChildren();
  for (const c of COLLECTIBLES) {
    const card = document.createElement('div');
    card.className = 'collect-card';
    const h = document.createElement('h3');
    h.textContent = c.name;
    const total = document.createElement('p');
    const big = document.createElement('span');
    big.className = 'big-num';
    big.textContent = c.total;
    total.append(big);
    const need = document.createElement('p');
    need.textContent = c.need;
    const link = document.createElement('p');
    const t = byId(c.trophy);
    if (t) {
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = `Trophy: ${t.name}`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        selectedId = t.id;
        setView('checklist');
      });
      link.append(a);
    }
    card.append(h, total, need, link);
    grid.append(card);
  }
}

function renderAll() {
  document.getElementById('listView').hidden = view !== 'checklist';
  document.getElementById('roadmapView').hidden = view !== 'roadmap';
  document.getElementById('missablesView').hidden = view !== 'missables';
  document.getElementById('collectiblesView').hidden = view !== 'collectibles';
  document.querySelectorAll('.tabs button').forEach((b) =>
    b.classList.toggle('active', b.dataset.view === view));
  renderProgress();
  if (view === 'roadmap') renderRoadmap();
  else if (view === 'missables') renderMissables();
  else if (view === 'collectibles') renderCollectibles();
  else renderRows();
  renderDetail(detailEl, byId(selectedId) || null, earned, () => {
    const t = byId(selectedId);
    if (!t) return;
    if (earned.has(t.name)) earned.delete(t.name); else earned.add(t.name);
    saveStored(earned);
    renderAll();
  }, spoilerOn());
}

function setView(v) {
  view = v;
  renderAll();
}

document.querySelectorAll('.tabs button').forEach((b) =>
  b.addEventListener('click', () => setView(b.dataset.view)));

for (const id of ['search', 'kind', 'grade', 'hideEarned', 'spoiler']) {
  document.getElementById(id).addEventListener('input', renderAll);
  document.getElementById(id).addEventListener('change', renderAll);
}

document.getElementById('export').addEventListener('click', () => exportFile(earned));

document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const next = await importFile(file, trophies);
    if (!next) throw new Error('bad file');
    earned = next;
    saveStored(earned);
    renderAll();
  } catch {
    alert('That file is not a Vice Ledger progress export.');
  }
  e.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveStored(earned);
    renderAll();
  }
});

// Screenshot scenes (?shot=): pick a view, a demo progress set and a selected
// trophy, then flag readiness for the screenshot runner.
const SHOT_SCENES = {
  cover: { view: 'checklist', trophy: 28, checked: [2, 3, 4, 8, 9, 15, 16, 21, 33, 35, 44] },
  roadmap: { view: 'roadmap', trophy: 14, checked: [2, 3, 4, 8, 9, 15, 16, 21, 33, 35, 44] },
  missables: { view: 'missables', trophy: 28, checked: [2, 3, 4, 8, 9, 15, 16, 21, 33, 35, 44] },
  detail: { view: 'checklist', trophy: 14, spoiler: true, checked: [2, 3, 4, 8, 9, 15, 16, 21, 33, 35, 44] },
};

function applyShot(name) {
  const scene = SHOT_SCENES[name];
  if (!scene) return;
  view = scene.view;
  selectedId = scene.trophy;
  if (scene.spoiler) document.getElementById('spoiler').checked = true;
  for (const t of trophies) if (scene.checked.includes(t.id)) earned.add(t.name);
  saveStored(earned);
  renderAll();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

async function init() {
  const doc = await (await fetch('data/trophies.json')).json();
  trophies = doc.trophies;
  if (params.get('view')) view = params.get('view');
  if (params.get('kind')) document.getElementById('kind').value = params.get('kind');
  if (params.get('grade')) document.getElementById('grade').value = params.get('grade');
  if (params.get('spoiler') === 'on') document.getElementById('spoiler').checked = true;
  if (params.get('trophy')) selectedId = Number(params.get('trophy'));
  if (params.get('checked')) {
    for (const t of trophies) {
      if (params.get('checked').split(',').map(Number).includes(t.id)) earned.add(t.name);
    }
    saveStored(earned);
  }
  renderAll();
  if (params.get('shot')) applyShot(params.get('shot'));
  else requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

init();
