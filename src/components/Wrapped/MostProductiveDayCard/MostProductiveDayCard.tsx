import { Sun, Zap, Coffee, Briefcase, Star, Moon } from "lucide-react";
import NeonCardBase from "../NeonCardBase/NeonCardBase";
import "./MostProductiveDayCard.css";

interface Props {
  day: string; // "Mon", "Tue", etc.
  count: number; // Total prompts on that day
}

export default function MostProductiveDayCard({ day, count }: Props) {
  
  // Enhanced Archetypes with specific Icons and descriptions
  const getPersona = (d: string) => {
    switch(d) {
      case "Mon": return { title: "The Early Bird", icon: Coffee, desc: "Starting the week with maximum velocity." };
      case "Tue": return { title: "The Momentum Builder", icon: Zap, desc: "Hitting stride when everyone else is just waking up." };
      case "Wed": return { title: "The Mid-Week Warrior", icon: Briefcase, desc: "Carrying the team through the hump day." };
      case "Thu": return { title: "The Focused Finisher", icon: Star, desc: "Wrapping up complex tasks before the deadline." };
      case "Fri": return { title: "The TGIF Techie", icon: Sun, desc: "Deploying on Fridays like a daredevil." };
      case "Sat": return { title: "The Weekend Hacker", icon: Moon, desc: "Building dreams while the world sleeps." };
      case "Sun": return { title: "The Sunday Strategist", icon: Coffee, desc: "Planning world domination for the week ahead." };
      default: return { title: "The Consistent Creator", icon: Star, desc: "Every day is a good day to build." };
    }
  };

  const persona = getPersona(day);
  const Icon = persona.icon;

  const getDayFull = (d: string) => {
     const map: Record<string, string> = {
         "Mon": "MONDAYS", "Tue": "TUESDAYS", "Wed": "WEDNESDAYS",
         "Thu": "THURSDAYS", "Fri": "FRIDAYS", "Sat": "SATURDAYS", "Sun": "SUNDAYS"
     };
     return map[d] || d.toUpperCase();
  };

  return (
    <NeonCardBase className="mpd-base">
      
      {/* Background Decor */}
      <div className="mpd-bg-gradient" />

      {/* 1. Header Icon */}
      <div className="mpd-icon-box">
        <Icon size={36} strokeWidth={2} className="mpd-icon" />
      </div>

      <h3 className="mpd-label-small">YOUR POWER DAY</h3>

      {/* 2. Hero Day */}
      <h1 className="mpd-hero-day">{getDayFull(day)}</h1>

      {/* 3. Stat Context */}
      <p className="mpd-stat">
        You sent <strong>{count.toLocaleString()}</strong> prompts on {day}s this year.
      </p>

      {/* 4. Achievement Badge */}
      <div className="mpd-badge">
        <div className="mpd-badge-header">
          <span className="mpd-badge-label">ARCHETYPE UNLOCKED</span>
        </div>
        <h2 className="mpd-badge-title">{persona.title}</h2>
        <p className="mpd-badge-desc">{persona.desc}</p>
      </div>

    </NeonCardBase>
  );
}