/* eslint-disable react-hooks/exhaustive-deps */
import { createPortal } from "react-dom";
import "./ProcessingModal.css";
import { useEffect, useState } from "react";

export default function ProcessingModal() {
  const steps = [
  "Parsing conversations…",
  "Analyzing prompts…",
  "Generating insights…",
];

const [currentStep, setCurrentStep] = useState(0);
const [completedSteps, setCompletedSteps] = useState<number[]>([]);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentStep(prev => {
      if (prev < steps.length - 1) {
        setCompletedSteps(c => [...c, prev]);
        return prev + 1;
      }
      return prev;
    });
  }, 40);

  return () => clearInterval(interval);
}, []);

const progress = ((completedSteps.length + 1) / steps.length) * 100;

  return createPortal(
    <div className="pm-overlay">
      <div className="pm-container">
        <div className="pm-loader"></div>
        <h2 className="pm-title">Processing your Rewind…</h2>
        <p className="pm-subtitle">
          Hang tight while we analyze your conversations.json
        </p>
        {/* Progress bar */}
<div className="pm-progress-bar">
  <div
    className="pm-progress-fill"
    style={{ width: `${progress}%` }}
  />
</div>

{/* Step list */}
<div className="pm-steps-list">
  {steps.map((step, index) => (
    <div
      key={index}
      className={`pm-step-row 
        ${index === currentStep ? "active-step" : ""} 
        ${completedSteps.includes(index) ? "completed-step" : ""}`}
    >
      <div className="pm-step-icon">
        {completedSteps.includes(index) ? (
          <div className="pm-step-check">✔</div>
        ) : index === currentStep ? (
          <div className="pm-step-loading"></div>
        ) : (
          <div className="pm-step-idle"></div>
        )}
      </div>

      <span className="pm-step-text">
        {step}
      </span>
    </div>
  ))}
</div>

      </div>
    </div>, 
    document.body 
  );
}