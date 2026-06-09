import { useRef, useCallback } from 'react';

const DB_NAME    = 'YachtDiceDB';
const DB_VERSION = 1;
const STORE_CUR  = 'currentGame';
const STORE_HIST = 'gameHistory';

export function useDB() {
  const dbRef = useRef(null);

  const open = useCallback(() => new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_CUR))
        db.createObjectStore(STORE_CUR,  { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_HIST))
        db.createObjectStore(STORE_HIST, { keyPath: 'gameId' });
    };
    req.onsuccess = e => { dbRef.current = e.target.result; resolve(); };
    req.onerror   = e => reject(e.target.error);
  }), []);

  const tx = useCallback((store, mode, fn) => new Promise((res, rej) => {
    if (!dbRef.current) return res(null);
    const t = dbRef.current.transaction(store, mode);
    const r = fn(t.objectStore(store));
    if (r) {
      r.onsuccess = e => res(e.target.result);
      r.onerror   = e => rej(e.target.error);
    } else {
      t.oncomplete = () => res(null);
      t.onerror    = e => rej(e.target.error);
    }
  }), []);

  const saveCurrent    = useCallback(s  => tx(STORE_CUR,  'readwrite', st => { st.put({ id: 'current', ...s }); }), [tx]);
  const loadCurrent    = useCallback(()  => tx(STORE_CUR,  'readonly',  st => st.get('current')), [tx]);
  const clearCurrent   = useCallback(()  => tx(STORE_CUR,  'readwrite', st => { st.delete('current'); }), [tx]);
  const saveHistory    = useCallback(s  => tx(STORE_HIST, 'readwrite', st => { st.put(s); }), [tx]);
  const deleteHistory  = useCallback(id => tx(STORE_HIST, 'readwrite', st => { st.delete(id); }), [tx]);

  const loadHistory = useCallback(() => new Promise((res, rej) => {
    if (!dbRef.current) return res([]);
    const req = dbRef.current.transaction(STORE_HIST, 'readonly').objectStore(STORE_HIST).getAll();
    req.onsuccess = e => res(
      (e.target.result || []).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    );
    req.onerror = e => rej(e.target.error);
  }), []);

  return { open, saveCurrent, loadCurrent, clearCurrent, saveHistory, loadHistory, deleteHistory };
}
