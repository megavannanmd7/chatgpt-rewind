import { MessageSquare } from "lucide-react";
import NeonCardBase from "../NeonCardBase/NeonCardBase";
import "./TotalPromptsCard.css";

interface Props {
  totalPrompts: number;
  avgPromptsPerDay: number;
}

export default function TotalPromptsCard({ totalPrompts, avgPromptsPerDay }: Props) {
  const formattedTotal = totalPrompts.toLocaleString();
  const formattedAvg = Math.round(avgPromptsPerDay);

  return (
    <NeonCardBase className="tpc-base">
      
      {/* 1. Icon Header - Floating slightly */}
      <div className="tpc-icon-box">
        <MessageSquare size={32} strokeWidth={2} className="tpc-icon" />
      </div>

      {/* 2. Small Label */}
      <h3 className="tpc-label-small">YOU SENT</h3>

      {/* 3. The Big Number */}
      <h1 className="tpc-hero-number">{formattedTotal}</h1>

      {/* 4. Subtitle */}
      <h2 className="tpc-subtitle">prompts to ChatGPT</h2>

      {/* 5. Footer / Average Stat */}
      <p className="tpc-footer">
        That’s about <strong>{formattedAvg}</strong> prompts per day!
      </p>

    </NeonCardBase>
  );
}