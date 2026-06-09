import { useState, useEffect, useCallback, useRef } from 'react';
import {
  createNewGame,
  calcTotal,
  getLeader,
  isGameComplete,
} from './utils/scoring';

import { ALL_CATEGORIES, MAX_PLAYERS, createInitialScores } from './utils/categories';
import { useDB } from './hooks/useDB';
import { useGistHistory } from './hooks/useGistHistory';

import StickyHeader      from './components/StickyHeader';
import ScoreTable        from './components/ScoreTable';
import InputSheet        from './components/InputSheet';
import GameEndModal      from './components/GameEndModal';
import RestoreModal      from './components/RestoreModal';
import HistorySection    from './components/HistorySection';

import './App.css';

export default function App() {
  const db   = useDB();
  const gist = useGistHistory();

  const [game,         setGame]        = useState(null);
  const [inputSheet,   setInputSheet]  = useState({ open: false, playerIdx: null, catId: null, isEdit: false });
  const [showRestore,  setShowRestore] = useState(false);
  const [showGameEnd,  setShowGameEnd] = useState(false);
  const [showHistory,  setShowHistory] = useState(false);

  const savedRef   = useRef(null); // holds the saved game while restore modal is open
  const saveTimer  = useRef(null);

  /* ── Init: open DB, check for saved game ── */
  useEffect(() => {
    db.open()
      .then(() => db.loadCurrent())
      .then(saved => {
        if (saved && !saved.isFinished && saved.players?.length) {
          savedRef.current = saved;
          setShowRestore(true);
        } else {
          setGame(createNewGame(1));
        }
      })
      .catch(() => setGame(createNewGame(1)));
  }, []); // eslint-disable-line

  /* ── Auto-save on every game change ── */
  useEffect(() => {
    if (!game || game.isFinished) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      db.saveCurrent(game).catch(console.error);
    }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [game]); // eslint-disable-line

  /* ── Finish game helper ── */
  const finishGame = useCallback((g) => {
    const sorted = [...g.players]
      .map(p => ({ name: p.name, total: calcTotal(p.scores) }))
      .sort((a, b) => b.total - a.total);
    const finished = {
      ...g,
      isFinished:  true,
      winner:      sorted[0].name,
      winnerScore: sorted[0].total,
    };
    setGame(finished);
    gist.saveHistory(finished).catch(console.error);
    db.clearCurrent().catch(console.error);
    setShowGameEnd(true);
  }, [db]);

  /* ── Auto-detect game completion ── */
  useEffect(() => {
    if (!game || game.isFinished) return;
    if (!isGameComplete(game.players)) return;
    const t = setTimeout(() => finishGame(game), 600);
    return () => clearTimeout(t);
  }, [game, finishGame]);

  /* ── Restore modal actions ── */
  const handleRestore = () => {
    setGame(savedRef.current);
    setShowRestore(false);
  };
  const handleRestoreDecline = () => {
    db.clearCurrent().catch(console.error);
    setGame(createNewGame(1));
    setShowRestore(false);
  };

  /* ── Score input ── */
  const handleCellClick = (playerIdx, catId)         => setInputSheet({ open: true, playerIdx, catId, isEdit: false });
  const handleEditCell  = (playerIdx, catId)         => setInputSheet({ open: true, playerIdx, catId, isEdit: true  });
  const handleCloseSheet = ()                         => setInputSheet({ open: false, playerIdx: null, catId: null, isEdit: false });

  const handleSaveScore = (value) => {
    const { playerIdx, catId } = inputSheet;
    setGame(prev => ({
      ...prev,
      players: prev.players.map((p, i) =>
        i === playerIdx
          ? { ...p, scores: { ...p.scores, [catId]: value } }
          : p
      ),
    }));
    handleCloseSheet();
  };

  /* ── Player management ── */
  const handleAddPlayer = () => {
    if (!game || game.players.length >= MAX_PLAYERS) return;
    const idx = game.players.length;
    setGame(prev => ({
      ...prev,
      players: [...prev.players, { name: `플레이어 ${idx + 1}`, scores: createInitialScores() }],
    }));
  };

  const handleRenamePlayer = (playerIdx, newName) => {
    setGame(prev => ({
      ...prev,
      players: prev.players.map((p, i) => i === playerIdx ? { ...p, name: newName } : p),
    }));
  };


  /* ── Game controls ── */
  const handleReset = () => {
    if (!confirm('게임을 초기화하시겠습니까? 현재 기록이 삭제됩니다.')) return;
    db.clearCurrent().catch(console.error);
    setGame(createNewGame(1));
    setShowGameEnd(false);
  };

  const handleNewGame = () => {
    setShowGameEnd(false);
    setGame(createNewGame(1));
  };

  /* ── Render ── */
  const loading = !game && !showRestore;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100svh', color: 'var(--text-muted)' }}>
        로딩 중…
      </div>
    );
  }

  const leader    = game ? getLeader(game.players) : null;
  const hasAnyScore = game ? game.players.some(p => Object.values(p.scores).some(v => v !== null)) : false;

  return (
    <div className="app">

      {/* ── Restore modal (shown before game is set) ── */}
      {showRestore && (
        <RestoreModal onRestore={handleRestore} onNewGame={handleRestoreDecline} />
      )}

      {/* ── Main game UI ── */}
      {game && (
        <>
          <StickyHeader
            leader={leader}
            playerCount={game.players.length}
            onAddPlayer={handleAddPlayer}
            onReset={handleReset}
            canAddPlayer={!hasAnyScore}
            onHistory={() => setShowHistory(true)}
          />

          <ScoreTable
            game={game}
            onCellClick={handleCellClick}
            onEditCell={handleEditCell}
            onRenamePlayer={handleRenamePlayer}
          />

        </>
      )}

      {/* ── Input bottom sheet ── */}
      {inputSheet.open && game && (
        <InputSheet
          playerIdx={inputSheet.playerIdx}
          catId={inputSheet.catId}
          playerName={game.players[inputSheet.playerIdx]?.name}
          isEdit={inputSheet.isEdit}
          currentValue={game.players[inputSheet.playerIdx]?.scores[inputSheet.catId]}
          onSave={handleSaveScore}
          onCancel={handleCloseSheet}
        />
      )}

      {/* ── Game end modal ── */}
      {showGameEnd && game && (
        <GameEndModal
          game={game}
          onNewGame={handleNewGame}
        />
      )}

      {/* ── History modal ── */}
      <HistorySection
        gist={gist}
        open={showHistory}
        onClose={() => setShowHistory(false)}
      />

    </div>
  );
}
