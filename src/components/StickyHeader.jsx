import { MAX_PLAYERS } from '../utils/categories';

export default function StickyHeader({ leader, playerCount, onAddPlayer, onReset, canAddPlayer, onHistory }) {
  const leaderText =
    leader && leader.total > 0
      ? `🏆 ${leader.name}이(가) 앞서고 있어요 · ${leader.total}점`
      : '요트 다이스 점수 계산기';

  return (
    <header className="sticky-header">
      <div className="leader-bar">{leaderText}</div>
      <div className="header-controls">
        <button
          className="btn-chip"
          onClick={onAddPlayer}
          disabled={playerCount >= MAX_PLAYERS || !canAddPlayer}
        >
          ＋ 플레이어  <span style={{ opacity: 0.6, fontSize: 11 }}>{playerCount}/{MAX_PLAYERS}</span>
        </button>
        <button className="btn-chip btn-chip-ghost" onClick={onReset}>
          ↺ 리셋
        </button>
        <button className="btn-chip btn-chip-ghost" onClick={onHistory}>
          게임기록
        </button>
      </div>
    </header>
  );
}
