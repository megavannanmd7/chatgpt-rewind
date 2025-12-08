import { CalendarDays, Flame } from "lucide-react";
import NeonCardBase from "../NeonCardBase/NeonCardBase";
import "./BusiestDateCard.css";

interface Props {
  busiestDate: {
    date: string; // "2025-05-20"
    count: number;
    conversations: { title: string; count: number }[];
  };
}

export default function BusiestDateCard({ busiestDate }: Props) {
  const dateObj = new Date(busiestDate.date);
  const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = dateObj.getDate();
  const weekday = dateObj.toLocaleString('default', { weekday: 'long' });

  // Dynamic "Vibe" text based on count
  const getVibe = (count: number) => {
    if (count > 100) return "You were absolutely on fire! 🔥";
    if (count > 50) return "A massive brainstorming session. 🧠";
    return "Productivity at its peak. 📈";
  };

  return (
    <NeonCardBase className="bdc-base">
      
      {/* 1. Header with "Fire" Theme */}
      <div className="bdc-header">
        <div className="bdc-icon-box">
          <CalendarDays size={28} className="bdc-icon" />
        </div>
        <h3 className="bdc-label-small">THE DAY YOU WERE UNSTOPPABLE</h3>
      </div>

      {/* 2. Calendar Hero Visual */}
      <div className="bdc-calendar-hero">
        <div className="bdc-cal-top">{month}</div>
        <div className="bdc-cal-body">{day}</div>
      </div>

      {/* 3. Context Line */}
      <div className="bdc-context">
        <p className="bdc-weekday">It was a {weekday}</p>
        <div className="bdc-pill">
          <Flame size={12} fill="#f43f5e" stroke="none" />
          <span>{busiestDate.count} prompts sent</span>
        </div>
      </div>

      {/* 4. The Daily Agenda (Conversation List) */}
      <div className="bdc-list-wrapper">
        <p className="bdc-list-title">TOP TOPICS THAT DAY</p>
        <div className="bdc-list">
          {busiestDate.conversations.slice(0, 3).map((c, i) => (
            <div key={i} className="bdc-item">
              <div className="bdc-item-bullet" />
              <div className="bdc-item-info">
                <span className="bdc-item-name">{c.title}</span>
                <span className="bdc-item-meta">{c.count} messages</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="bdc-footer-quote">{getVibe(busiestDate.count)}</p>

    </NeonCardBase>
  );
}