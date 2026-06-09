import { calcTotal } from '../utils/scoring';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function GameEndModal({ game, onNewGame }) {
  const sorted = [...game.players]
    .map(p => ({ name: p.name, total: calcTotal(p.scores) }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon">🏆</div>
        <h2>게임 종료!</h2>
        <p style={{ marginBottom: 4 }}>
          <strong style={{ color: '#4F46E5' }}>{sorted[0].name}</strong>님이 우승했습니다
        </p>

        <div className="result-list">
          {sorted.map((p, i) => (
            <div key={i} className={`result-item${i === 0 ? ' result-first' : ''}`}>
              <span>{MEDALS[i] ?? `${i + 1}위`}&nbsp; {p.name}</span>
              <span className="result-score">{p.total.toLocaleString()}점</span>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={onNewGame}>새 게임 시작</button>
        </div>
      </div>
    </div>
  );
}
