import { Download, Settings, FileJson, Shield, ExternalLink } from "lucide-react";
import "./HowToGetFile.css";

export default function HowToGetFile() {
  const steps = [
    {
      icon: Settings,
      title: "Open Settings",
      description: "Go to chat.openai.com and click on your profile icon, then Settings.",
    },
    {
      icon: Download,
      title: "Request Export",
      description: 'Navigate to Data Controls → Export Data and click "Export".',
    },
    {
      icon: FileJson,
      title: "Download ZIP",
      description: "You'll receive an email with a download link within a few hours.",
    },
    {
      icon: ExternalLink,
      title: "Extract File",
      description: "Unzip the file and locate conversations.json inside.",
    },
  ];

  return (
    <div className="howto-container">
      <div className="howto-header">
        <h3>How to get your conversations.json</h3>
        <p>Follow these simple steps to export your ChatGPT data</p>
      </div>

      <div className="howto-grid">
        {steps.map((step, index) => (
          <div key={index} className="howto-card">
            <div className="howto-icon-wrapper">
              <div className="howto-icon">
                <step.icon size={28} className="icon-primary" />
              </div>
              <span className="howto-step-number">{index + 1}</span>
            </div>

            <h4 className="howto-card-title">{step.title}</h4>
            <p className="howto-card-desc">{step.description}</p>
          </div>
        ))}
      </div>

      {/* Privacy Banner */}
      <div className="privacy-card">
        <div className="privacy-icon">
          <Shield size={30} className="icon-primary" />
        </div>
        <div>
          <h4 className="privacy-title">
            Your data never leaves your device{" "}
            <span className="secure-pill">Secure</span>
          </h4>
          <p className="privacy-desc">
            All processing happens locally in your browser. We don't store,
            upload, or share any of your conversation data. Your privacy is guaranteed.
          </p>
        </div>
      </div>
    </div>
  );
}
