/* Reading stats — daily tracking, streak, totals */

import * as store from './storage.js';

const IDLE_MS = 60_000;
const TICK_MS = 5_000;
const STREAK_DAILY_MS = 60_000;

let lastActivity = Date.now();
let tickTimer = null;

const $ = (s) => document.querySelector(s);

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isActive() {
  if (document.visibilityState !== 'visible') return false;
  if (Date.now() - lastActivity > IDLE_MS) return false;
  return $('#reader-view')?.classList.contains('active');
}

async function ensureToday() {
  const date = todayKey();
  let stat = await store.getStat(date);
  if (!stat) {
    stat = { date, ms_read: 0, words_read: 0, docs_opened: 0 };
    await store.putStat(stat);
  }
  return stat;
}

async function tick() {
  if (!isActive()) return;
  const stat = await ensureToday();
  stat.ms_read += TICK_MS;
  await store.putStat(stat);
  refreshBadge();
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

async function recordDocument(text, filename) {
  const stat = await ensureToday();
  stat.words_read += countWords(text);
  stat.docs_opened = (stat.docs_opened || 0) + 1;
  await store.putStat(stat);
  refreshBadge();
}

// ─── Streak ───
export async function computeStreak() {
  const stats = await store.listStats();
  const eligible = stats
    .filter((s) => s.ms_read >= STREAK_DAILY_MS)
    .map((s) => s.date)
    .sort();
  if (eligible.length === 0) return 0;

  const today = todayKey();
  const yesterday = dateKey(new Date(Date.now() - 86400000));
  const last = eligible[eligible.length - 1];
  if (last !== today && last !== yesterday) return 0;

  let streak = 1;
  let cursor = new Date(last + 'T00:00:00');
  for (let i = eligible.length - 2; i >= 0; i--) {
    const prev = new Date(cursor);
    prev.setDate(prev.getDate() - 1);
    if (eligible[i] === dateKey(prev)) {
      streak++;
      cursor = prev;
    } else {
      break;
    }
  }
  return streak;
}

export async function getTodayStat() {
  return (await store.getStat(todayKey())) || { date: todayKey(), ms_read: 0, words_read: 0, docs_opened: 0 };
}

export async function getTotals() {
  const stats = await store.listStats();
  return stats.reduce(
    (acc, s) => ({
      ms_read: acc.ms_read + (s.ms_read || 0),
      words_read: acc.words_read + (s.words_read || 0),
      docs_opened: acc.docs_opened + (s.docs_opened || 0),
      days: acc.days + (s.ms_read >= STREAK_DAILY_MS ? 1 : 0),
    }),
    { ms_read: 0, words_read: 0, docs_opened: 0, days: 0 }
  );
}

export async function getLast14Days() {
  const stats = await store.listStats();
  const map = new Map(stats.map((s) => [s.date, s]));
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    days.push({
      date: key,
      label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      ms_read: map.get(key)?.ms_read || 0,
      words_read: map.get(key)?.words_read || 0,
    });
  }
  return days;
}

// ─── UI: badge + modal ───
function formatMinutes(ms) {
  if (ms < 60_000) return '0 min';
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${String(m).padStart(2, '0')}`;
}

function formatNumber(n) {
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1).replace('.', ',') + ' k';
  return Math.round(n / 1000) + ' k';
}

async function refreshBadge() {
  const badge = $('#stats-badge');
  if (!badge) return;
  const streak = await computeStreak();
  const today = await getTodayStat();
  const flame = badge.querySelector('.stats-flame');
  const num = badge.querySelector('.stats-streak-num');
  const time = badge.querySelector('.stats-today');
  num.textContent = streak;
  time.textContent = formatMinutes(today.ms_read);
  flame.classList.toggle('active', streak > 0);
}

async function refreshModal() {
  const streak = await computeStreak();
  const today = await getTodayStat();
  const totals = await getTotals();
  const days = await getLast14Days();

  $('#stats-streak').textContent = streak;
  $('#stats-streak-label').textContent = streak === 1 ? 'jour' : 'jours';

  $('#stats-today-min').textContent = formatMinutes(today.ms_read);
  $('#stats-today-words').textContent = formatNumber(today.words_read) + ' mots';

  $('#stats-total-time').textContent = formatMinutes(totals.ms_read);
  $('#stats-total-words').textContent = formatNumber(totals.words_read);
  $('#stats-total-docs').textContent = totals.docs_opened;
  $('#stats-total-days').textContent = totals.days;

  // 14-day chart
  const max = Math.max(1, ...days.map((d) => d.ms_read));
  const chart = $('#stats-chart');
  chart.innerHTML = '';
  days.forEach((d) => {
    const col = document.createElement('div');
    col.className = 'stats-bar-col';
    const bar = document.createElement('div');
    bar.className = 'stats-bar';
    bar.style.height = `${Math.max(2, (d.ms_read / max) * 100)}%`;
    if (d.ms_read >= STREAK_DAILY_MS) bar.classList.add('eligible');
    bar.title = `${d.label} · ${formatMinutes(d.ms_read)}`;
    col.appendChild(bar);
    chart.appendChild(col);
  });
}

function openStatsModal() {
  $('#stats-modal').classList.add('open');
  $('#stats-backdrop').classList.add('visible');
  refreshModal();
}

function closeStatsModal() {
  $('#stats-modal').classList.remove('open');
  $('#stats-backdrop').classList.remove('visible');
}

// ─── Init ───
export function initStats() {
  // Activity tracking
  ['scroll', 'mousemove', 'keydown', 'click', 'touchstart'].forEach((ev) => {
    window.addEventListener(ev, () => { lastActivity = Date.now(); }, { passive: true });
  });

  // Tick timer
  tickTimer = setInterval(tick, TICK_MS);

  // Pause when hidden, resume on visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') lastActivity = Date.now();
  });

  // Hook document rendered → count words
  window.addEventListener('liseuse:document-rendered', (e) => {
    recordDocument(e.detail.text, e.detail.filename);
  });

  // Badge click → modal
  $('#stats-badge').addEventListener('click', openStatsModal);
  $('#stats-close').addEventListener('click', closeStatsModal);
  $('#stats-backdrop').addEventListener('click', closeStatsModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#stats-modal').classList.contains('open')) {
      closeStatsModal();
    }
  });

  refreshBadge();
}
