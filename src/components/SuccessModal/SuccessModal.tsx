import { createPortal } from "react-dom";
import "./SuccessModal.css";
interface SuccessModalProps {
  onDashboard: () => void;
  onWrapped: () => void;
}

export default function SuccessModal({ onDashboard, onWrapped }: SuccessModalProps) {
  return createPortal(
    <div className="sm-overlay">
      <div className="sm-container">
        <h2 className="sm-title">Your Rewind is Ready! 🎉</h2>
        <p className="sm-subtitle">
          We’ve processed your conversations.json.
          What would you like to view?
        </p>

        <div className="sm-buttons">
          <button className="sm-btn-primary" onClick={onDashboard}>
            View Dashboard
          </button>

          <button className="sm-btn-secondary" onClick={onWrapped}>
            Wrapped Cards
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
