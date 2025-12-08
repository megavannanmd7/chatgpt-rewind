import { Sparkles } from "lucide-react";
import NeonCardBase from "../NeonCardBase/NeonCardBase";
import "./WelcomeCard.css";

export function WelcomeCard() {
  return (
    <NeonCardBase className="welcome-card-base">
      
      {/* 1. Glowing Icon */}
      <div className="welcome-icon-box">
        <Sparkles size={32} color="#0d1117" strokeWidth={2.5} />
      </div>

      {/* 2. Small Uppercase Label */}
      <h3 className="welcome-label">YOUR YEAR IN REVIEW</h3>

      {/* 3. Main Title */}
      <div className="welcome-title-group">
        <h1 className="wt-gradient">ChatGPT</h1>
        <h1 className="wt-white">Rewind '25</h1>
      </div>

      {/* 4. Subtitle */}
      <p className="welcome-desc">
        Let’s look back at your year of<br />prompting.
      </p>

      {/* 5. Swipe Hint */}
      <div className="swipe-hint-container">
        <div className="swipe-line" />
        <span className="swipe-text">Swipe to begin</span>
        <div className="swipe-line" />
      </div>

    </NeonCardBase>
  );
}