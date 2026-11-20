// Vice Ledger — the detail panel: one trophy's guide, steps, sources and flags.
// Everything here is built with DOM calls (no innerHTML for trophy text) so a
// trophy name can never inject markup into the page.
export function gradeBadge(grade) {
  const span = document.createElement('span');
  span.className = `badge ${grade}`;
  span.textContent = grade;
  return span;
}

export function kindLabel(kind) {
  if (kind === 'story') return 'Story';
  if (kind === 'activity') return 'Activity';
  if (kind === 'combat') return 'Combat & heists';
  if (kind === 'collectible') return 'Collectible';
  if (kind === 'exploration') return 'Exploration';
  return kind;
}

export function difficultyDots(level) {
  const n = Math.max(1, Math.min(5, level || 1));
  return '●'.repeat(n) + '○'.repeat(5 - n);
}

// Renders the selected trophy into the detail element. Pass null to show the
// empty state. `earned` is the Set of earned names; `onToggle` runs when the
// reader marks the trophy earned or not.
export function renderDetail(detailEl, t, earned, onToggle, spoilerOn) {
  detailEl.replaceChildren();
  if (!t) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Select a trophy to read its guide and sources.';
    detailEl.append(p);
    return;
  }
  const hidden = spoilerOn && t.kind === 'story' && !earned.has(t.name);
  const name = hidden ? 'Hidden story trophy — earn it to reveal' : t.name;
  const desc = hidden
    ? 'Hidden until earned (spoiler-safe mode is on).'
    : t.description;

  const h = document.createElement('h2');
  h.textContent = name;
  detailEl.append(h);

  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  meta.append(gradeBadge(t.grade));
  meta.append(document.createTextNode(` ${kindLabel(t.kind)} · Roadmap phase ${t.stage} · Difficulty ${difficultyDots(t.difficulty)} · ${t.time} (estimate)`));
  if (t.missable) {
    const flag = document.createElement('span');
    flag.className = 'flag missable';
    flag.textContent = 'MISSABLE';
    meta.append(document.createTextNode(' '), flag);
  }
  if (t.timeSensitive) {
    const flag = document.createElement('span');
    flag.className = 'flag watch';
    flag.textContent = 'TIME-SENSITIVE';
    meta.append(document.createTextNode(' '), flag);
  }
  detailEl.append(meta);

  const off = document.createElement('p');
  off.className = 'official';
  off.textContent = `Official description: “${desc}”`;
  detailEl.append(off);

  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = t.guide;
  detailEl.append(guide);

  if (Array.isArray(t.steps) && t.steps.length) {
    const stepsTitle = document.createElement('h3');
    stepsTitle.textContent = 'How to do it';
    detailEl.append(stepsTitle);
    const ol = document.createElement('ol');
    ol.className = 'steps';
    for (const s of t.steps) {
      const li = document.createElement('li');
      li.textContent = s;
      ol.append(li);
    }
    detailEl.append(ol);
  }

  if (t.when) {
    const when = document.createElement('p');
    when.className = 'when-line';
    const strong = document.createElement('strong');
    strong.textContent = 'When: ';
    when.append(strong, document.createTextNode(t.when));
    detailEl.append(when);
  }

  if (t.missableNote) {
    const note = document.createElement('p');
    note.className = 'when-line';
    const strong = document.createElement('strong');
    strong.textContent = 'Why it can be missed: ';
    note.append(strong, document.createTextNode(t.missableNote));
    detailEl.append(note);
  }

  const srcTitle = document.createElement('h3');
  srcTitle.textContent = 'Sources';
  detailEl.append(srcTitle);
  const srcList = document.createElement('ul');
  srcList.className = 'sources';
  for (const s of t.sources || []) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.label;
    a.rel = 'noopener';
    a.target = '_blank';
    li.append(a);
    srcList.append(li);
  }
  detailEl.append(srcList);

  const note = document.createElement('p');
  note.className = 'estimate-note';
  note.textContent = 'Difficulty and time are this guide’s own estimates. Methods marked “inferred” are read from the official description, not from a published walkthrough.';
  detailEl.append(note);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'earn-btn';
  btn.textContent = earned.has(t.name) ? 'Mark as not earned' : 'Mark as earned';
  btn.addEventListener('click', onToggle);
  detailEl.append(btn);
}
