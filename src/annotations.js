/* Annotations — highlights with optional notes, persisted via prefix/suffix anchoring */

import * as store from './storage.js';
import { getCurrentDocId } from './library.js';

const $ = (s) => document.querySelector(s);
const ANCHOR_PAD = 30;

function textOffset(root, node, offset) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let cumulative = 0;
  let n;
  while ((n = walker.nextNode())) {
    if (n === node) return cumulative + offset;
    cumulative += n.textContent.length;
  }
  return cumulative;
}

function captureAnchor(range, content) {
  const fullText = content.textContent;
  const startGlobal = textOffset(content, range.startContainer, range.startOffset);
  const endGlobal = textOffset(content, range.endContainer, range.endOffset);
  const prefix = fullText.slice(Math.max(0, startGlobal - ANCHOR_PAD), startGlobal);
  const suffix = fullText.slice(endGlobal, Math.min(fullText.length, endGlobal + ANCHOR_PAD));
  const text = fullText.slice(startGlobal, endGlobal);
  return { prefix, text, suffix };
}

function findRangeAtOffsets(root, start, end) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let cumulative = 0;
  let startNode = null, startOffsetIn = 0, endNode = null, endOffsetIn = 0;
  let n;
  while ((n = walker.nextNode())) {
    const len = n.textContent.length;
    if (!startNode && cumulative + len > start) {
      startNode = n;
      startOffsetIn = start - cumulative;
    }
    if (cumulative + len >= end) {
      endNode = n;
      endOffsetIn = end - cumulative;
      break;
    }
    cumulative += len;
  }
  if (!startNode || !endNode) return null;
  const range = document.createRange();
  try {
    range.setStart(startNode, startOffsetIn);
    range.setEnd(endNode, endOffsetIn);
  } catch (e) {
    return null;
  }
  return range;
}

function reanchor(content, ann) {
  const fullText = content.textContent;
  const needle = ann.prefix + ann.text + ann.suffix;
  let idx = fullText.indexOf(needle);
  if (idx === -1) {
    // Fallback: search by text + suffix or prefix + text
    idx = fullText.indexOf(ann.prefix + ann.text);
    if (idx === -1) idx = fullText.indexOf(ann.text + ann.suffix);
    if (idx === -1) idx = fullText.indexOf(ann.text);
    if (idx === -1) return null;
    return findRangeAtOffsets(content, idx, idx + ann.text.length);
  }
  const startOffset = idx + ann.prefix.length;
  const endOffset = startOffset + ann.text.length;
  return findRangeAtOffsets(content, startOffset, endOffset);
}

function wrapRange(range, ann) {
  const mark = document.createElement('mark');
  mark.className = `ann-mark ann-${ann.color}`;
  mark.dataset.annId = ann.id;
  if (ann.note) {
    mark.dataset.note = ann.note;
    mark.classList.add('has-note');
  }
  try {
    range.surroundContents(mark);
    return mark;
  } catch (e) {
    // Multi-element range — extract and wrap
    const frag = range.extractContents();
    mark.appendChild(frag);
    range.insertNode(mark);
    return mark;
  }
}

async function renderAnnotations() {
  const docId = getCurrentDocId();
  if (!docId) return;
  const content = $('#content');
  const anns = await store.listAnnotations(docId);
  for (const ann of anns) {
    const range = reanchor(content, ann);
    if (range) wrapRange(range, ann);
  }
}

// ─── Toolbar ───
let toolbar = null;
let activeRange = null;

function ensureToolbar() {
  if (toolbar) return toolbar;
  toolbar = document.createElement('div');
  toolbar.id = 'ann-toolbar';
  toolbar.innerHTML = `
    <button class="ann-color ann-yellow" data-color="yellow" title="Surligner jaune"></button>
    <button class="ann-color ann-orange" data-color="orange" title="Surligner ambre"></button>
    <button class="ann-color ann-green" data-color="green" title="Surligner vert"></button>
    <span class="ann-sep"></span>
    <button class="ann-note-btn" title="Ajouter une note">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    </button>
  `;
  document.body.appendChild(toolbar);
  toolbar.addEventListener('mousedown', (e) => e.preventDefault());
  toolbar.querySelectorAll('.ann-color').forEach((btn) => {
    btn.addEventListener('click', () => createHighlight(btn.dataset.color, null));
  });
  toolbar.querySelector('.ann-note-btn').addEventListener('click', () => {
    const note = prompt('Votre note :');
    if (note && note.trim()) createHighlight('orange', note.trim());
  });
  return toolbar;
}

function showToolbar(rect) {
  ensureToolbar();
  toolbar.classList.add('visible');
  const top = window.scrollY + rect.top - 52;
  const left = window.scrollX + rect.left + rect.width / 2;
  toolbar.style.top = `${Math.max(8 + window.scrollY, top)}px`;
  toolbar.style.left = `${left}px`;
}

function hideToolbar() {
  if (toolbar) toolbar.classList.remove('visible');
  activeRange = null;
}

async function createHighlight(color, note) {
  if (!activeRange) return;
  const docId = getCurrentDocId();
  if (!docId) return;
  const content = $('#content');
  const anchor = captureAnchor(activeRange, content);
  if (!anchor.text.trim()) { hideToolbar(); return; }
  const ann = await store.saveAnnotation({
    document_id: docId,
    color,
    note: note || null,
    ...anchor,
  });
  // wrap the live selection
  wrapRange(activeRange, ann);
  window.getSelection().removeAllRanges();
  hideToolbar();
}

function onSelectionChange() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
    hideToolbar();
    return;
  }
  const range = sel.getRangeAt(0);
  const content = $('#content');
  if (!content || !content.contains(range.commonAncestorContainer)) {
    hideToolbar();
    return;
  }
  const text = sel.toString().trim();
  if (text.length < 2) { hideToolbar(); return; }
  activeRange = range.cloneRange();
  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) { hideToolbar(); return; }
  showToolbar(rect);
}

// ─── Mark interactions (delete, note tooltip) ───
function onMarkClick(e) {
  const mark = e.target.closest('.ann-mark');
  if (!mark) return;
  e.stopPropagation();
  const id = mark.dataset.annId;
  const note = mark.dataset.note;
  const action = note
    ? prompt(`Note : "${note}"\n\nTapez "x" pour supprimer, ou modifiez la note :`, note)
    : confirm('Supprimer ce surlignage ?') ? 'x' : null;
  if (action === 'x' || action === null && !note) {
    store.deleteAnnotation(id);
    // unwrap mark
    const parent = mark.parentNode;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  } else if (action && action !== note) {
    // update note
    store.saveAnnotation({ id, document_id: getCurrentDocId(), note: action,
      color: mark.classList.contains('ann-yellow') ? 'yellow' : mark.classList.contains('ann-green') ? 'green' : 'orange',
      text: mark.textContent, prefix: '', suffix: '' });
    mark.dataset.note = action;
    mark.classList.add('has-note');
  }
}

// ─── Init ───
export function initAnnotations() {
  document.addEventListener('selectionchange', onSelectionChange);
  document.addEventListener('mousedown', (e) => {
    if (toolbar && !toolbar.contains(e.target) && !window.getSelection().toString()) {
      hideToolbar();
    }
  });
  document.addEventListener('click', onMarkClick);

  window.addEventListener('liseuse:document-rendered', () => {
    renderAnnotations();
  });
}
