export default function RestoreModal({ onRestore, onNewGame }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon">🎲</div>
        <h2>이전 게임 복원</h2>
        <p>진행 중인 게임이 있습니다.<br />계속하시겠습니까?</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onNewGame}>새 게임 시작</button>
          <button className="btn-primary"   onClick={onRestore}>이어서 하기</button>
        </div>
      </div>
    </div>
  );
}
