import "./ProcessingModal.css";

export default function ProcessingModal() {
  return (
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
    </div>
  );
}
