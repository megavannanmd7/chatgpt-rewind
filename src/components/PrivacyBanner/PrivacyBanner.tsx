import { useState } from "react";
import "./PrivacyBanner.css";

export default function PrivacyBanner() {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="pb-container">
      <p className="pb-message">
        Your data never leaves your device. All processing happens locally in your
        browser, nothing is uploaded or stored.
      </p>

      <button className="pb-close" onClick={() => setClosed(true)}>
        ✕
      </button>
    </div>
  );
}
