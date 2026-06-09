import { UPPER_CATEGORIES, LOWER_CATEGORIES } from '../utils/categories';
import { calcUpperTotal, calcBonus, calcTotal, formatDate } from '../utils/scoring';

export default function HistoryDetailModal({ game, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card modal-wide">
        <h2 style={{ fontSize: 16 }}>게임 상세</h2>
        <p style={{ fontSize: 12, margin: '4px 0 8px', color: 'var(--t-muted)' }}>
          {formatDate(game.timestamp)} · {game.players.length}명
        </p>

        <div className="history-detail-wrap">
          <table className="history-detail-table">
            <thead>
              <tr>
                <th className="th-label">플레이어</th>
                {game.players.map((p, i) => <th key={i}>{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {/* 상단 */}
              {UPPER_CATEGORIES.map(cat => (
                <tr key={cat.id}>
                  <td className="td-label">{cat.label}</td>
                  {game.players.map((p, i) => <td key={i}>{p.scores[cat.id] ?? '−'}</td>)}
                </tr>
              ))}

              {/* 보너스 */}
              <tr className="row-bonus">
                <td className="td-label">보너스</td>
                {game.players.map((p, i) => {
                  const ut    = calcUpperTotal(p.scores);
                  const bonus = calcBonus(p.scores);
                  return <td key={i}>{ut}/63{bonus > 0 ? ' ✓' : ''}</td>;
                })}
              </tr>

              {/* 하단 */}
              {LOWER_CATEGORIES.map(cat => (
                <tr key={cat.id}>
                  <td className="td-label">{cat.label}</td>
                  {game.players.map((p, i) => <td key={i}>{p.scores[cat.id] ?? '−'}</td>)}
                </tr>
              ))}

              {/* TOTAL */}
              <tr className="row-total">
                <td className="td-label">TOTAL</td>
                {game.players.map((p, i) => (
                  <td key={i}>{calcTotal(p.scores)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="btn-primary" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}
