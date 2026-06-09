import { useState, useEffect, useRef } from 'react';
import { ALL_CATEGORIES } from '../utils/categories';

export default function InputSheet({ playerIdx, catId, playerName, isEdit, currentValue, onSave, onCancel }) {
  const cat        = ALL_CATEGORIES.find(c => c.id === catId);
  const isDiceMode = !!cat.diceValue;
  const isToggle   = !!cat.fixedScore;

  const initCount = isEdit && currentValue !== null && currentValue !== undefined
    ? (isDiceMode ? currentValue / cat.diceValue : currentValue)
    : 0;

  const [val, setVal] = useState(initCount);
  const inputRef      = useRef(null);

  useEffect(() => {
    if (!isDiceMode && !isToggle) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, []);

  const handleSave = () => {
    if (isDiceMode) {
      onSave(val * cat.diceValue);
    } else {
      const num = parseInt(val, 10);
      if (isNaN(num)) { alert('올바른 숫자를 입력해주세요.'); return; }
      onSave(Math.max(cat.min, Math.min(cat.max, num)));
    }
  };

  const handleDelete = () => onSave(null);

  return (
    <div className="sheet-overlay">
      <div className="sheet-backdrop" onClick={onCancel} />
      <div className="sheet-card">
        <div className="sheet-handle" />

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <div className="sheet-title">{cat.label}</div>
          <div style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>{playerName}</div>
        </div>

        {/* ── 달성/미달성 토글 모드 ── */}
        {isToggle ? (
          <>
            <div className="sheet-hint">달성 여부를 선택하세요</div>
            <div className="toggle-btns">
              <button className="toggle-btn toggle-success" onClick={() => onSave(cat.fixedScore)}>
                <span className="toggle-btn-score">{cat.fixedScore}점</span>
                <span className="toggle-btn-label">달성</span>
              </button>
              <button className="toggle-btn toggle-fail" onClick={() => onSave(0)}>
                <span className="toggle-btn-score">0점</span>
                <span className="toggle-btn-label">미달성</span>
              </button>
            </div>
            <button className="btn-delete" style={{ marginTop: 12 }} onClick={handleDelete}>삭제</button>
          </>
        ) : isDiceMode ? (
          /* ── 주사위 +/- 카운터 ── */
          <>
            <div className="sheet-hint">주사위 개수를 선택하세요</div>
            <div className="dice-counter">
              <button className="dice-btn" onClick={() => setVal(v => Math.max(0, v - 1))} disabled={val <= 0}>−</button>
              <div className="dice-count-display">
                <span className="dice-count-num">{val}</span>
                <span className="dice-count-label">개</span>
              </div>
              <button className="dice-btn" onClick={() => setVal(v => Math.min(5, v + 1))} disabled={val >= 5}>＋</button>
            </div>
            <div className="dice-preview">
              <span className="dice-preview-eq">{val}개 × {cat.diceValue}</span>
              {' = '}
              <strong>{val * cat.diceValue}점</strong>
            </div>
            <div className="sheet-actions">
              <button className="btn-delete" onClick={handleDelete}>삭제</button>
              <button className="btn-primary" onClick={handleSave}>저장</button>
            </div>
          </>
        ) : (
          /* ── 일반 숫자 입력 ── */
          <>
            <div className="sheet-hint">0 ~ {cat.max}점</div>
            <input
              ref={inputRef}
              type="number"
              className="score-input"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              value={val === 0 ? '' : val}
              min={cat.min}
              max={cat.max}
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <div className="sheet-actions">
              <button className="btn-delete" onClick={handleDelete}>삭제</button>
              <button className="btn-primary" onClick={handleSave}>저장</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
