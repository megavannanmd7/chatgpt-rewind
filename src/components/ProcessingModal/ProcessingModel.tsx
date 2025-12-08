import { createPortal } from "react-dom";
import "./ProcessingModal.css";

export default function ProcessingModal() {
  // The modal is always visible when it's mounted.
  // We can remove the state and effect for visibility.
  // The parent component should control whether this modal is in the DOM.
  // The CSS will handle the fade-in animation on its own.
  return createPortal(
    // By just having the 'show' class, we avoid the initial 'hidden-init' state
    // that was causing the layout shift. The animation can be handled
    // purely in CSS with @keyframes.
    <div className="pm-overlay">
      <div className="pm-container">
        <div className="pm-loader"></div>
        <h2 className="pm-title">Processing your Rewind…</h2>
        <p className="pm-subtitle">
          Hang tight while we analyze your conversations.json
        </p>
        <div className="pm-steps">
          <p>• Parsing conversations</p>
          <p>• Analyzing prompts</p>
          <p>• Generating insights</p>
        </div>
      </div>
    </div>, // The JSX to portal
    document.body // The destination
  );
}