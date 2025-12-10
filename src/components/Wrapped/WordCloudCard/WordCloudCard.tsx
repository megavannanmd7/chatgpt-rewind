import { Search, BrainCircuit } from "lucide-react";
import NeonCardBase from "../NeonCardBase/NeonCardBase";
import "./WordCloudCard.css";

interface Topic {
  topic: string;
  count: number;
}

interface Props {
  topics: Topic[];
}

export default function WordCloudCard({ topics }: Props) {
  // Sort DESC by count
  const sorted = [...topics].sort((a, b) => b.count - a.count);

  // Take top 10
  const topWords = sorted.slice(0, 10);

  // Create 10 size levels smoothly
  const getSizeClass = (index: number) => `wc-size-${index}`;

  return (
    <NeonCardBase className="wcc-base">
      <div className="wcc-bg-glow" />

      <div className="wcc-icon-box">
        <Search size={32} strokeWidth={2.5} className="wcc-icon" />
      </div>

      <h3 className="wcc-label-small">YOU KEPT ASKING ABOUT</h3>

      <div className="wcc-cloud-container">
        {topWords.map((t, i) => (
          <span
            key={t.topic}
            className={`wcc-word ${getSizeClass(i)} color-${i % 4}`}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            {t.topic}
          </span>
        ))}
      </div>

      <div className="wcc-footer">
        <BrainCircuit size={16} className="wcc-footer-icon" />
        <p>From rabbit holes to breakthroughs.</p>
      </div>
    </NeonCardBase>
  );
}
