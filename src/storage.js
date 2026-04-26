/* MDRead — IndexedDB wrapper, local-first store

The DB_NAME stays "liseuse" intentionally: changing it would orphan
existing user data on the current alias. Internal naming is decoupled
from the public brand. */

const DB_NAME = 'liseuse';
const DB_VERSION = 1;

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('documents')) {
        const docs = db.createObjectStore('documents', { keyPath: 'id' });
        docs.createIndex('updated_at', 'updated_at');
        docs.createIndex('title', 'title');
      }
      if (!db.objectStoreNames.contains('annotations')) {
        const anns = db.createObjectStore('annotations', { keyPath: 'id' });
        anns.createIndex('document_id', 'document_id');
      }
      if (!db.objectStoreNames.contains('stats')) {
        db.createObjectStore('stats', { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(storeName, mode = 'readonly') {
  return openDB().then((db) => db.transaction(storeName, mode).objectStore(storeName));
}

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function uuid() {
  return crypto.randomUUID();
}

// ─── Documents ───
export async function listDocuments() {
  const store = await tx('documents');
  const docs = await reqToPromise(store.getAll());
  return docs.sort((a, b) => b.updated_at - a.updated_at);
}

export async function getDocument(id) {
  const store = await tx('documents');
  return reqToPromise(store.get(id));
}

export async function saveDocument({ id, title, content, folder_id = null }) {
  const now = Date.now();
  const existing = id ? await getDocument(id) : null;
  const doc = {
    id: id || uuid(),
    title,
    content,
    folder_id,
    file_size: new Blob([content]).size,
    created_at: existing?.created_at || now,
    updated_at: now,
  };
  const store = await tx('documents', 'readwrite');
  await reqToPromise(store.put(doc));
  return doc;
}

export async function deleteDocument(id) {
  const store = await tx('documents', 'readwrite');
  await reqToPromise(store.delete(id));
  // Cascade annotations
  const annStore = await tx('annotations', 'readwrite');
  const idx = annStore.index('document_id');
  const cursorReq = idx.openCursor(IDBKeyRange.only(id));
  return new Promise((resolve, reject) => {
    cursorReq.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) { cursor.delete(); cursor.continue(); } else resolve();
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

export async function searchDocuments(query) {
  const docs = await listDocuments();
  const q = query.toLowerCase().trim();
  if (!q) return docs;
  return docs.filter((d) =>
    d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
  );
}

// ─── Meta (last opened, prefs) ───
export async function getMeta(key) {
  const store = await tx('meta');
  const row = await reqToPromise(store.get(key));
  return row?.value;
}

export async function setMeta(key, value) {
  const store = await tx('meta', 'readwrite');
  await reqToPromise(store.put({ key, value }));
}

// ─── Stats (skeleton — Wave 2 fills behaviour) ───
export async function getStat(date) {
  const store = await tx('stats');
  return reqToPromise(store.get(date));
}

export async function putStat(stat) {
  const store = await tx('stats', 'readwrite');
  await reqToPromise(store.put(stat));
}

export async function listStats() {
  const store = await tx('stats');
  return reqToPromise(store.getAll());
}

// ─── Annotations (skeleton — Wave 3 fills) ───
export async function listAnnotations(documentId) {
  const store = await tx('annotations');
  const idx = store.index('document_id');
  return reqToPromise(idx.getAll(IDBKeyRange.only(documentId)));
}

export async function saveAnnotation(ann) {
  const store = await tx('annotations', 'readwrite');
  const row = { id: ann.id || uuid(), created_at: Date.now(), ...ann };
  await reqToPromise(store.put(row));
  return row;
}

export async function deleteAnnotation(id) {
  const store = await tx('annotations', 'readwrite');
  await reqToPromise(store.delete(id));
}

export { uuid };
