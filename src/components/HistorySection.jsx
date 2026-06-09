import { useState, useEffect } from 'react';
import { formatDate } from '../utils/scoring';
import HistoryDetailModal from './HistoryDetailModal';

export default function HistorySection({ gist, open, onClose }) {
  const { isConnected, saveToken, disconnect, loadHistory, deleteHistory, syncing, error } = gist;

  const [items,      setItems]      = useState([]);
  const [detail,     setDetail]     = useState(null);
  const [tokenDraft, setTokenDraft] = useState('');
  const [connecting, setConnecting] = useState(false);

  const refresh = async () => {
    const data = await loadHistory();
    setItems(data);
  };

  useEffect(() => { if (open && isConnected) refresh(); }, [open, isConnected]);

  const handleConnect = async () => {
    if (!tokenDraft.trim()) return;
    setConnecting(true);
    try {
      // 토큰 유효성 확인
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${tokenDraft.trim()}` },
      });
      if (!res.ok) throw new Error('유효하지 않은 토큰입니다');
      saveToken(tokenDraft.trim());
    } catch (e) {
      alert(e.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDelete = async (e, gameId) => {
    e.stopPropagation();
    if (!confirm('이 게임 기록을 삭제하시겠습니까?')) return;
    await deleteHistory(gameId);
    refresh();
  };

  if (!open) return null;

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-card modal-wide">
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>지난 게임 기록</h2>

          {!isConnected ? (
            /* ── GitHub 연결 ── */
            <div className="gist-setup">
              <p className="gist-setup-desc">
                GitHub Personal Access Token을 입력하면<br />
                브라우저가 달라도 기록이 유지됩니다.
              </p>
              <input
                className="gist-token-input"
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={tokenDraft}
                onChange={e => setTokenDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConnect()}
              />
              <p className="gist-setup-hint">
                GitHub → Settings → Developer settings → Personal access tokens → <strong>gist</strong> 권한만 선택
              </p>
              <div className="modal-actions" style={{ marginTop: 12 }}>
                <button className="btn-secondary" onClick={onClose}>닫기</button>
                <button className="btn-primary" onClick={handleConnect} disabled={connecting || !tokenDraft.trim()}>
                  {connecting ? '연결 중…' : '연결'}
                </button>
              </div>
            </div>
          ) : (
            /* ── 기록 목록 ── */
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
                <button className="gist-disconnect-btn" onClick={disconnect}>연결 해제</button>
              </div>

              {syncing && <p className="gist-syncing">동기화 중…</p>}
              {error   && <p className="gist-error">{error}</p>}

              <div className="history-list" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                {items.length === 0 ? (
                  <p className="empty-history">아직 완료된 게임이 없습니다.</p>
                ) : (
                  items.map((game, idx) => (
                    <div
                      key={game.gameId}
                      className={`history-item${idx % 2 === 0 ? '' : ' history-item-alt'}`}
                      onClick={() => setDetail(game)}
                    >
                      <div className="history-item-info">
                        <div className="history-date">
                          {formatDate(game.timestamp)} · {game.players.length}명
                        </div>
                        <div className="history-winner">
                          🏆 {game.winner} — {game.winnerScore}점
                        </div>
                      </div>
                      <button
                        className="history-delete-btn"
                        onClick={e => handleDelete(e, game.gameId)}
                      >
                        삭제
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="modal-actions" style={{ marginTop: 16 }}>
                <button className="btn-primary" onClick={onClose}>닫기</button>
              </div>
            </>
          )}
        </div>
      </div>

      {detail && (
        <HistoryDetailModal
          game={detail}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
