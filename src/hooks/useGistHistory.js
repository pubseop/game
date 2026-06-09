import { useState, useCallback } from 'react';
import { fetchGistHistory, createGist, updateGist } from '../utils/gistService';

const TOKEN_KEY   = 'yacht_gh_token';
const GIST_ID_KEY = 'yacht_gist_id';

export function useGistHistory() {
  const [token,   setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY)   || '');
  const [gistId,  setGistIdState] = useState(() => localStorage.getItem(GIST_ID_KEY) || '');
  const [syncing, setSyncing]    = useState(false);
  const [error,   setError]      = useState(null);

  const isConnected = !!token;

  const saveToken = useCallback((t, gid = '') => {
    setTokenState(t);
    setGistIdState(gid);
    localStorage.setItem(TOKEN_KEY, t);
    if (gid) localStorage.setItem(GIST_ID_KEY, gid);
    else     localStorage.removeItem(GIST_ID_KEY);
    setError(null);
  }, []);

  const disconnect = useCallback(() => {
    setTokenState('');
    setGistIdState('');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(GIST_ID_KEY);
    setError(null);
  }, []);

  const loadHistory = useCallback(async () => {
    if (!token || !gistId) return [];
    try {
      return await fetchGistHistory(token, gistId);
    } catch (e) {
      setError(e.message);
      return [];
    }
  }, [token, gistId]);

  const saveHistory = useCallback(async (game) => {
    if (!token) return;
    setSyncing(true);
    setError(null);
    try {
      let currentGistId = gistId;
      let history = [];

      if (currentGistId) {
        history = await fetchGistHistory(token, currentGistId);
      }

      const idx = history.findIndex(g => g.gameId === game.gameId);
      if (idx >= 0) history[idx] = game;
      else history.unshift(game);

      if (!currentGistId) {
        currentGistId = await createGist(token, history);
        setGistIdState(currentGistId);
        localStorage.setItem(GIST_ID_KEY, currentGistId);
      } else {
        await updateGist(token, currentGistId, history);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  }, [token, gistId]);

  const deleteHistory = useCallback(async (gameId) => {
    if (!token || !gistId) return;
    setSyncing(true);
    try {
      const history = await fetchGistHistory(token, gistId);
      await updateGist(token, gistId, history.filter(g => g.gameId !== gameId));
    } catch (e) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  }, [token, gistId]);

  return { isConnected, token, gistId, saveToken, disconnect, loadHistory, saveHistory, deleteHistory, syncing, error };
}
