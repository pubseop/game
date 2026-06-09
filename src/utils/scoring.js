import {
  UPPER_CATEGORIES,
  LOWER_CATEGORIES,
  BONUS_THRESHOLD,
  BONUS_SCORE,
  createInitialScores,
} from './categories';

export function calcUpperTotal(scores) {
  return UPPER_CATEGORIES.reduce((s, c) => s + (scores[c.id] ?? 0), 0);
}

export function calcBonus(scores) {
  return calcUpperTotal(scores) >= BONUS_THRESHOLD ? BONUS_SCORE : 0;
}

export function calcLowerTotal(scores) {
  return LOWER_CATEGORIES.reduce((s, c) => s + (scores[c.id] ?? 0), 0);
}

export function calcTotal(scores) {
  return calcUpperTotal(scores) + calcBonus(scores) + calcLowerTotal(scores);
}

export function getLeader(players) {
  if (!players?.length) return null;
  return players.reduce((best, p, i) => {
    const total = calcTotal(p.scores);
    return total > best.total ? { ...p, index: i, total } : best;
  }, { ...players[0], index: 0, total: calcTotal(players[0].scores) });
}

export function isGameComplete(players) {
  return players.every(p =>
    [...UPPER_CATEGORIES, ...LOWER_CATEGORIES].every(
      c => p.scores[c.id] !== null && p.scores[c.id] !== undefined
    )
  );
}

export function createNewGame(playerCount = 4) {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const gameId = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  return {
    gameId,
    timestamp: now.toISOString(),
    isFinished: false,
    players: Array.from({ length: playerCount }, (_, i) => ({
      name: `플레이어 ${i + 1}`,
      scores: createInitialScores(),
    })),
  };
}

export function buildExportData(game) {
  return {
    gameId:      game.gameId,
    timestamp:   game.timestamp,
    isFinished:  game.isFinished,
    winner:      game.winner ?? null,
    players: game.players.map(p => ({
      name:         p.name,
      upperSection: Object.fromEntries(UPPER_CATEGORIES.map(c => [c.id, p.scores[c.id]])),
      upperTotal:   calcUpperTotal(p.scores),
      bonus:        calcBonus(p.scores),
      lowerSection: Object.fromEntries(LOWER_CATEGORIES.map(c => [c.id, p.scores[c.id]])),
      lowerTotal:   calcLowerTotal(p.scores),
      total:        calcTotal(p.scores),
    })),
  };
}

export function formatDate(iso) {
  if (!iso) return '';
  const d   = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
