/* Focus mode — dim everything except the paragraph closest to viewport center */

const $ = (s) => document.querySelector(s);
const STORAGE_KEY = 'liseuse-focus-mode';

let active = false;
let scrollHandler = null;
let currentEl = null;

function getFocusableElements() {
  const content = $('#content');
  if (!content) return [];
  return Array.from(content.children).filter((el) => {
    if (el.classList.contains('end-mark')) return false;
    return true;
  });
}

function findActiveParagraph() {
  const els = getFocusableElements();
  if (els.length === 0) return null;
  const center = window.innerHeight / 2;
  let closest = null;
  let minDist = Infinity;
  for (const el of els) {
    const rect = el.getBoundingClientRect();
    const elCenter = rect.top + rect.height / 2;
    const dist = Math.abs(elCenter - center);
    if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
    if (dist < minDist) {
      minDist = dist;
      closest = el;
    }
  }
  return closest;
}

function refreshActive() {
  const next = findActiveParagraph();
  if (next === currentEl) return;
  if (currentEl) currentEl.classList.remove('focus-active');
  if (next) next.classList.add('focus-active');
  currentEl = next;
}

function enable() {
  if (active) return;
  active = true;
  document.body.classList.add('focus-mode');
  scrollHandler = () => requestAnimationFrame(refreshActive);
  window.addEventListener('scroll', scrollHandler, { passive: true });
  window.addEventListener('resize', scrollHandler);
  refreshActive();
  localStorage.setItem(STORAGE_KEY, '1');
  $('#focus-btn')?.classList.add('active');
}

function disable() {
  if (!active) return;
  active = false;
  document.body.classList.remove('focus-mode');
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler);
    window.removeEventListener('resize', scrollHandler);
    scrollHandler = null;
  }
  if (currentEl) currentEl.classList.remove('focus-active');
  currentEl = null;
  localStorage.setItem(STORAGE_KEY, '0');
  $('#focus-btn')?.classList.remove('active');
}

function toggle() {
  active ? disable() : enable();
}

export function initFocusMode() {
  const btn = $('#focus-btn');
  if (btn) btn.addEventListener('click', toggle);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'f' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
      e.preventDefault();
      toggle();
    }
  });

  // Re-refresh active paragraph when new doc renders
  window.addEventListener('liseuse:document-rendered', () => {
    if (active) {
      currentEl = null;
      requestAnimationFrame(refreshActive);
    }
  });

  // Restore preference
  if (localStorage.getItem(STORAGE_KEY) === '1') {
    // Wait one frame so #content is populated
    requestAnimationFrame(() => {
      if ($('#reader-view')?.classList.contains('active')) enable();
    });
    window.addEventListener('liseuse:document-rendered', () => enable(), { once: true });
  }
}
