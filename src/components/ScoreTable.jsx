import { useState } from 'react';
import { UPPER_CATEGORIES, LOWER_CATEGORIES } from '../utils/categories';
import { calcUpperTotal, calcBonus, calcTotal } from '../utils/scoring';

/* ── Player name header cell with inline editing ── */
function PlayerHeader({ player, index, onRename, isLeader }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState('');

  const startEdit = () => { setDraft(player.name); setEditing(true); };
  const commit    = () => {
    setEditing(false);
    const name = draft.trim();
    if (name) onRename(index, name);
  };

  return (
    <div className="player-name-cell">
      {editing ? (
        <input
          className="player-name-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') e.target.blur(); }}
          autoFocus
          maxLength={10}
        />
      ) : (
        <span className="player-name-text" onClick={startEdit} title="이름 클릭하여 변경">
          {player.name}
        </span>
      )}
      {isLeader && <span className="player-rank-badge">1위</span>}
    </div>
  );
}

/* ── Individual score cell ── */
function ScoreCell({ playerIdx, catId, value, onCellClick, onEditCell }) {
  const empty = value === null || value === undefined;

  if (empty) {
    return (
      <td className="score-cell empty" onClick={() => onCellClick(playerIdx, catId)}>
        <span className="cell-plus">+</span>
      </td>
    );
  }
  return (
    <td className="score-cell locked" onClick={() => onEditCell(playerIdx, catId)}>
      <div className="cell-content">
        <span className="cell-score">{value}</span>
      </div>
    </td>
  );
}

/* ── Main table ── */
export default function ScoreTable({ game, onCellClick, onEditCell, onRenamePlayer }) {
  const { players } = game;

  const totals   = players.map(p => calcTotal(p.scores));
  const maxTotal = Math.max(...totals);
  const isLeader = i => totals[i] === maxTotal && maxTotal > 0;

  return (
    <div className="table-wrapper">
      <table className="score-table">

        {/* ── Header row ── */}
        <thead>
          <tr>
            <th className="cat-col">플레이어</th>
            {players.map((p, i) => (
              <th key={i}>
                <PlayerHeader
                  player={p}
                  index={i}
                  onRename={onRenamePlayer}
                  isLeader={isLeader(i)}
                />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {UPPER_CATEGORIES.map(cat => (
            <tr key={cat.id}>
              <td className="cat-col">
                <span className="cat-label">{cat.label}</span>
              </td>
              {players.map((p, i) => (
                <ScoreCell
                  key={i}
                  playerIdx={i}
                  catId={cat.id}
                  value={p.scores[cat.id]}
                  onCellClick={onCellClick}
                  onEditCell={onEditCell}
                />
              ))}
            </tr>
          ))}


          {/* 보너스 */}
          <tr className="bonus-row">
            <td className="cat-col"><span className="cat-label">보너스</span></td>
            {players.map((p, i) => {
              const ut    = calcUpperTotal(p.scores);
              const bonus = calcBonus(p.scores);
              return (
                <td key={i} className="score-cell locked">
                  <div className="cell-content">
                    <span className="cell-score bonus-score" style={{ color: '#fff' }}>
                      {ut}/63
                    </span>
                    {bonus > 0 && <span className="bonus-badge">+35</span>}
                  </div>
                </td>
              );
            })}
          </tr>

          {LOWER_CATEGORIES.map(cat => (
            <tr key={cat.id}>
              <td className="cat-col">
                <span className="cat-label">{cat.label}</span>
              </td>
              {players.map((p, i) => (
                <ScoreCell
                  key={i}
                  playerIdx={i}
                  catId={cat.id}
                  value={p.scores[cat.id]}
                  onCellClick={onCellClick}
                  onEditCell={onEditCell}
                />
              ))}
            </tr>
          ))}

          {/* ─ TOTAL ─ */}
          <tr className="total-row">
            <td className="cat-col">TOTAL</td>
            {players.map((p, i) => (
              <td key={i} className="score-cell locked">
                <div className="cell-content">
                  <span className="cell-score">{calcTotal(p.scores)}</span>
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
