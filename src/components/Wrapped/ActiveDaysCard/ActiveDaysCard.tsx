// Generate random opacities once when the module loads
// const RANDOM_OPACITIES = Array.from({ length: 48 }).map(
//   () => Math.random() * 0.1 + 0.05
// );

import { Calendar } from "lucide-react";
import NeonCardBase from "../NeonCardBase/NeonCardBase";
import "./ActiveDaysCard.css";

interface Props {
  days: number;
}

export default function ActiveDaysCard({ days }: Props) {
  const percentage = Math.min(100, Math.round((days / 365) * 100));

  return (
    <NeonCardBase className="adc-base">

      <div className="adc-icon-box">
        <Calendar size={32} strokeWidth={2} className="adc-icon" />
      </div>

      <h3 className="adc-label-small">YOU WERE ACTIVE</h3>

      <h1 className="adc-hero-number">{days}</h1>

      
      <h2 className="adc-subtitle">days on ChatGPT </h2>
      <h2 className="adc-subtitle adc-subtitle-second">this year</h2>




      <div className="adc-progress-container">
        <div className="adc-progress-bar">
          <div 
            className="adc-progress-fill" 
            style={{ width: `${percentage}%` }} 
          />
        </div>
        <p className="adc-progress-text">{percentage}% of the year</p>
      </div>

    </NeonCardBase>
  );
}
