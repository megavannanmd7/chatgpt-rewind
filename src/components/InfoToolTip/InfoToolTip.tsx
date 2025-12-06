import { useState } from "react";
import { Info } from "lucide-react";
import "./InfoTooltip.css";

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export function InfoTooltip({ content, className }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={`info-tooltip-wrapper ${className || ""}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <Info size={15} className="info-tooltip-icon" />

      {visible && (
        <div className="info-tooltip-bubble">
          {content}
          <span className="info-tooltip-arrow" />
        </div>
      )}
    </span>
  );
}
