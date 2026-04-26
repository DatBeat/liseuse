/* Inline editor — edit raw MD in a drawer, save back to IDB, re-render */

import * as store from './storage.js';
import { getCurrentDocId } from './library.js';
import { renderMarkdown } from './reader.js';

const $ = (s) => document.querySelector(s);

let initialContent = '';
let initialTitle = '';

async function openEditor() {
  const docId = getCurrentDocId();
  if (!docId) return;
  const doc = await store.getDocument(docId);
  if (!doc) return;
  initialContent = doc.content;
  initialTitle = doc.title;
  $('#editor-title').value = doc.title;
  $('#editor-textarea').value = doc.content;
  $('#editor-drawer').classList.add('open');
  $('#editor-backdrop').classList.add('visible');
  setTimeout(() => $('#editor-textarea').focus(), 100);
  refreshDirty();
}

function closeEditor(force = false) {
  if (!force && isDirty() && !confirm('Modifications non sauvegardées. Fermer quand même ?')) return;
  $('#editor-drawer').classList.remove('open');
  $('#editor-backdrop').classList.remove('visible');
}

function isDirty() {
  return $('#editor-textarea').value !== initialContent || $('#editor-title').value !== initialTitle;
}

function refreshDirty() {
  $('#editor-save').disabled = !isDirty();
}

async function saveEditor() {
  const docId = getCurrentDocId();
  if (!docId) return;
  const title = $('#editor-title').value.trim() || 'Document';
  const content = $('#editor-textarea').value;
  await store.saveDocument({ id: docId, title, content });
  initialContent = content;
  initialTitle = title;
  refreshDirty();
  renderMarkdown(content, title);
}

export function initEditor() {
  $('#edit-btn')?.addEventListener('click', openEditor);
  $('#editor-close')?.addEventListener('click', () => closeEditor());
  $('#editor-backdrop')?.addEventListener('click', () => closeEditor());
  $('#editor-save')?.addEventListener('click', saveEditor);
  ['input', 'change'].forEach((ev) => {
    $('#editor-textarea')?.addEventListener(ev, refreshDirty);
    $('#editor-title')?.addEventListener(ev, refreshDirty);
  });

  document.addEventListener('keydown', (e) => {
    const open = $('#editor-drawer')?.classList.contains('open');
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeEditor();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      saveEditor();
    }
  });
}
