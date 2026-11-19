// Vice Legend — GTA VI trophy guide & tracker.
// Loads app/data/trophies.json, renders the roadmap, the missable list and the
// checklist, and keeps earned trophies in localStorage. Fully offline: it
// fetches only data/trophies.json, a file inside app/, and never the network.
const STORAGE_KEY = 'gta6-trophy-guide-progress-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoiler-v1';

const ROADMAP_STAGES = [
  { stage: 1, title: 'Play the story', text: 'Chapters 1 to 5 plus the final mission. All 12 story trophies land here on their own — just follow the main missions.' },
  { stage: 2, title: 'Do the one missable thing now', text: 'Meditate at the Chapter 1 spot before that chapter ends. It is the only trophy that can be missed, and there is no mission replay.' },
  { stage: 3, title: 'Collect while you roam', text: 'Cards, WAiNK photos, scanned vehicles and the full map. Chip away at these between missions so the cleanup is short.' },
  { stage: 4, title: 'Activities & grind', text: 'Races, the shooting range, stunts, robberies, character strands and the money goals. Most of it stays open in free roam.' },
  { stage: 5, title: 'Cleanup & platinum', text: 'Finish the 100% Completion checklist for the gold, and the platinum pops with the last trophy you earn.' },
];

const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities' };

const searchInput = document.getElementById('search');
const kindFilters = document.getElementById('kindFilters');
const gradeSelect = document.getElementById('grade');
const onlyUnearnedBox = document.getElementById('onlyUnearned');
const spoilerBox = document.getElementById('spoiler');
const cardsList = document.getElementById('cards');
const stagesList = document.getElementById('stages');
const missableList = document.getElementById('missableList');
const detailDialog = document.getElementById('detail');
const detailBody = document.getElementById('detailBody');

let trophies = [];
let earned = new Set(loadProgress());
let activeKind = 'all';
let spoilerOn = localStorage.getItem(SPOILER_KEY) === '1';

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((id) => Number.isInteger(id)) : [];
  } catch {
    return [];
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function loadTrophies() {
  return fetch('data/trophies.json').then((response) => response.json()).then((doc) => doc.trophies);
}

// A trophy is spoiler-hidden when spoiler mode is on, the trophy is hidden on
// PlayStation, it is a story trophy, and it has not been earned yet.
function isSpoilerHidden(trophy) {
  return spoilerOn && trophy.hidden && trophy.kind === 'story' && !earned.has(trophy.id);
}

function displayName(trophy) {
  return isSpoilerHidden(trophy) ? '??? Hidden Trophy' : trophy.name;
}

function displayDescription(trophy) {
  return isSpoilerHidden(trophy) ? 'Hidden until earned — spoiler-safe mode is on.' : trophy.description;
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function formatCount(trophy) {
  if (trophy.count === null || trophy.count === undefined) return null;
  return trophy.count.toLocaleString('en-US');
}

function updateProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById('progressCount').textContent = `${done} / ${total} earned`;
  document.getElementById('progressPct').textContent = `${pct}% to the platinum`;
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(done));
  document.getElementById('progressFill').style.width = `${pct}%`;
  const byGrade = {};
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    const got = inGrade.filter((t) => earned.has(t.id)).length;
    byGrade[grade] = `${got}/${inGrade.length}`;
  }
  document.getElementById('progressGrades').textContent =
    `Platinum ${byGrade.platinum} · Gold ${byGrade.gold} · Silver ${byGrade.silver} · Bronze ${byGrade.bronze}`;
}

function trophyMatchesFilters(trophy) {
  if (activeKind !== 'all' && trophy.kind !== activeKind) return false;
  if (gradeSelect.value !== 'all' && trophy.grade !== gradeSelect.value) return false;
  if (onlyUnearnedBox.checked && earned.has(trophy.id)) return false;
  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

function renderChecklist() {
  cardsList.replaceChildren();
  let shown = 0;
  for (const trophy of trophies) {
    if (!trophyMatchesFilters(trophy)) continue;
    shown += 1;
    const li = document.createElement('li');
    li.className = 'card' + (earned.has(trophy.id) ? ' earned' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.id);
    box.setAttribute('aria-label', `Earned: ${displayName(trophy)}`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.id);
      else earned.delete(trophy.id);
      saveProgress();
      renderAll();
    });
    const main = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'trophy-name';
    name.textContent = displayName(trophy);
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = displayDescription(trophy);
    const tags = document.createElement('div');
    tags.className = 'tags';
    const gradeTag = document.createElement('span');
    gradeTag.className = `tag grade-${trophy.grade}`;
    gradeTag.textContent = gradeLabel(trophy.grade);
    tags.append(gradeTag);
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
    tags.append(kindTag);
    if (trophy.hidden) {
      const hiddenTag = document.createElement('span');
      hiddenTag.className = 'tag hidden';
      hiddenTag.textContent = 'Hidden';
      tags.append(hiddenTag);
    }
    if (trophy.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag missable';
      missTag.textContent = 'Missable';
      tags.append(missTag);
    }
    const count = formatCount(trophy);
    if (count !== null) {
      const countTag = document.createElement('span');
      countTag.className = 'tag';
      countTag.textContent = `Count: ${count}`;
      tags.append(countTag);
    }
    main.append(name, desc, tags);
    const guideButton = document.createElement('button');
    guideButton.type = 'button';
    guideButton.className = 'guide-btn';
    guideButton.textContent = 'Guide';
    guideButton.addEventListener('click', () => openTrophyDetail(trophy.id));
    li.append(box, main, guideButton);
    cardsList.append(li);
  }
  document.getElementById('emptyState').hidden = shown !== 0;
  document.getElementById('resultCount').textContent = `Showing ${shown} of ${trophies.length}.`;
}

function renderRoadmap() {
  stagesList.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const li = document.createElement('li');
    li.className = 'stage';
    const head = document.createElement('div');
    const title = document.createElement('h3');
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = String(stage.stage);
    title.append(num, document.createTextNode(stage.title));
    const text = document.createElement('p');
    text.textContent = stage.text;
    head.append(title, text);
    const chips = document.createElement('div');
    chips.className = 'trophy-chips';
    for (const trophy of trophies.filter((t) => t.roadmap_stage === stage.stage)) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip' + (earned.has(trophy.id) ? ' earned' : '');
      const dot = document.createElement('span');
      dot.className = `dot ${trophy.grade}`;
      chip.append(dot, document.createTextNode(displayName(trophy)));
      chip.addEventListener('click', () => openTrophyDetail(trophy.id));
      chips.append(chip);
    }
    li.append(head, chips);
    stagesList.append(li);
  }
}

function renderMissable() {
  missableList.replaceChildren();
  const flagged = trophies.filter((t) => t.missable);
  for (const trophy of flagged) {
    const li = document.createElement('li');
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.textContent = '⚠ Missable — act during the story';
    const name = document.createElement('p');
    const nameStrong = document.createElement('strong');
    nameStrong.className = 'trophy-name';
    nameStrong.textContent = trophy.name;
    const gradeSpan = document.createElement('span');
    gradeSpan.textContent = ` · ${gradeLabel(trophy.grade)}`;
    name.append(nameStrong, gradeSpan);
    const reason = document.createElement('p');
    reason.textContent = trophy.missable_reason;
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'guide-btn';
    open.textContent = 'Open guide';
    open.addEventListener('click', () => openTrophyDetail(trophy.id));
    li.append(warn, name, reason, guide, open);
    missableList.append(li);
  }
}

function openTrophyDetail(id) {
  const trophy = trophies.find((t) => t.id === id);
  if (!trophy) return;
  detailBody.replaceChildren();
  const hidden = isSpoilerHidden(trophy);
  const title = document.createElement('h3');
  title.textContent = displayName(trophy);
  detailBody.append(title);
  if (hidden) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'This is a hidden story trophy and spoiler-safe mode is on. Earn it in the game (or switch spoiler-safe mode off) to reveal its name, description and guide.';
    detailBody.append(note);
  } else {
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = trophy.description;
    detailBody.append(desc);
    const factsTitle = document.createElement('h4');
    factsTitle.textContent = 'Facts';
    const facts = document.createElement('dl');
    facts.className = 'facts';
    const factRows = [
      ['Grade', gradeLabel(trophy.grade)],
      ['Kind', KIND_LABELS[trophy.kind] ?? trophy.kind],
      ['Hidden on PlayStation', trophy.hidden ? 'Yes' : 'No'],
      ['Missable', trophy.missable ? `Yes — ${trophy.missable_reason}` : 'No'],
      ['Count tracked', formatCount(trophy) ?? '—'],
      ['Roadmap stage', `Stage ${trophy.roadmap_stage} — ${ROADMAP_STAGES[trophy.roadmap_stage - 1].title}`],
    ];
    for (const [label, value] of factRows) {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      facts.append(dt, dd);
    }
    detailBody.append(factsTitle, facts);
    const guideTitle = document.createElement('h4');
    guideTitle.textContent = 'Guide';
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    detailBody.append(guideTitle, guide);
    const sourcesTitle = document.createElement('h4');
    sourcesTitle.textContent = 'Sources';
    const sources = document.createElement('ul');
    sources.className = 'sources';
    for (const source of trophy.sources) {
      const item = document.createElement('li');
      if (source.url) {
        const link = document.createElement('a');
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = source.name;
        item.append(link);
      } else {
        item.textContent = source.name;
      }
      sources.append(item);
    }
    detailBody.append(sourcesTitle, sources);
  }
  const earnRow = document.createElement('label');
  earnRow.className = 'earn-row';
  const earnBox = document.createElement('input');
  earnBox.type = 'checkbox';
  earnBox.checked = earned.has(trophy.id);
  earnBox.addEventListener('change', () => {
    if (earnBox.checked) earned.add(trophy.id);
    else earned.delete(trophy.id);
    saveProgress();
    renderAll();
    if (detailDialog.open) openTrophyDetail(id);
  });
  earnRow.append(earnBox, document.createTextNode('Earned'));
  detailBody.append(earnRow);
  if (!detailDialog.open) detailDialog.showModal();
}

function renderAll() {
  updateProgress();
  renderRoadmap();
  renderMissable();
  renderChecklist();
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    guide: 'Vice Legend trophy tracker',
    exported_at: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProgress(file) {
  const parsed = JSON.parse(await file.text());
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('Progress file has no earned list.');
  const valid = new Set(trophies.map((t) => t.id));
  earned = new Set(ids.filter((id) => valid.has(id)));
  saveProgress();
  renderAll();
}

function resetProgress() {
  if (!window.confirm('Reset all earned trophies? This clears your saved progress.')) return;
  earned = new Set();
  saveProgress();
  renderAll();
}

function setSpoilerMode(on) {
  spoilerOn = on;
  spoilerBox.checked = on;
  localStorage.setItem(SPOILER_KEY, on ? '1' : '0');
  renderAll();
}

// Fixed poses for the entry's screenshots: ?shot=guide opens a trophy's
// guide, ?shot=roadmap jumps to the roadmap, ?shot=spoiler turns spoiler
// mode on. ?kind=<kind> pre-selects a kind filter, so a pose can show one
// slice of the list (for example the story trophies under spoiler mode).
// The default pose is the plain checklist.
function applyShotPose() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const kind = params.get('kind');
  if (kind && KIND_LABELS[kind]) {
    activeKind = kind;
    for (const b of kindFilters.querySelectorAll('button')) {
      const on = b.dataset.kind === kind;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    }
    renderChecklist();
  }
  if (shot === 'spoiler') setSpoilerMode(true);
  if (shot === 'roadmap') document.getElementById('roadmap').scrollIntoView();
  if (shot === 'guide') openTrophyDetail(17);
}

function bindControls() {
  searchInput.addEventListener('input', renderChecklist);
  gradeSelect.addEventListener('change', renderChecklist);
  onlyUnearnedBox.addEventListener('change', renderChecklist);
  spoilerBox.addEventListener('change', () => setSpoilerMode(spoilerBox.checked));
  kindFilters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-kind]');
    if (!button) return;
    activeKind = button.dataset.kind;
    for (const b of kindFilters.querySelectorAll('button')) {
      const on = b === button;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    }
    renderChecklist();
  });
  document.getElementById('export').addEventListener('click', exportProgress);
  document.getElementById('import').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      await importProgress(file);
    } catch (error) {
      window.alert(`Could not import that file: ${error.message}`);
    }
    event.target.value = '';
  });
  document.getElementById('reset').addEventListener('click', resetProgress);
  detailDialog.addEventListener('click', (event) => {
    if (event.target === detailDialog) detailDialog.close();
  });
}

async function initViceLegend() {
  trophies = await loadTrophies();
  spoilerBox.checked = spoilerOn;
  bindControls();
  renderAll();
  applyShotPose();
  window.__trophyGuideReady = true;
}

initViceLegend();
