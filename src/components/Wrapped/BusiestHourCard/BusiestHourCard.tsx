import { useMemo } from "react";
import { Moon, Sun, Sunrise, Sunset, Coffee, Zap } from "lucide-react";
import NeonCardBase from "../NeonCardBase/NeonCardBase";
import "./BusiestHourCard.css";

interface Props {
  hour: string; // Format "14:00" or "02:00"
}

export default function BusiestHourCard({ hour }: Props) {
  const hourNum = parseInt(hour.split(":")[0], 10);

  // Determine Text, Icon, and Color Theme based on 3-hour blocks
  const { text, Icon, themeClass } = useMemo(() => {
    if (hourNum >= 0  && hourNum < 3)  return { text: "The Night Owl 🦉", Icon: Moon, themeClass: "theme-night" };

if (hourNum >= 3  && hourNum < 6)  return { text: "The Dawn Starter 🌄", Icon: Sunrise, themeClass: "theme-dawn" };

if (hourNum >= 6  && hourNum < 9)  return { text: "Morning Momentum ☀️", Icon: Coffee, themeClass: "theme-morning" };

if (hourNum >= 9  && hourNum < 12) return { text: "The Morning Peak Hours 🌞", Icon: Zap, themeClass: "theme-noon" };

if (hourNum >= 12 && hourNum < 15) return { text: "The Afternoon Grind ☀️", Icon: Sun, themeClass: "theme-afternoon" };

if (hourNum >= 15 && hourNum < 18) return { text: "The Golden Hour 🎨", Icon: Sunset, themeClass: "theme-sunset" };

if (hourNum >= 18 && hourNum < 21) return { text: "The Evening Chill 🍷", Icon: Sunset, themeClass: "theme-evening" };

    return { text: "The Late Night Spark ✨", Icon: Moon, themeClass: "theme-midnight" }; // 21-24
  }, [hourNum]);

  return (
    <NeonCardBase className={`bhc-base ${themeClass}`}>
      
      {/* Dynamic Background Glow */}
      <div className="bhc-bg-glow" />

      {/* 1. Floating Icon */}
      <div className="bhc-icon-box">
        <Icon size={36} strokeWidth={2.5} className="bhc-icon" />
      </div>

      {/* 2. Label */}
      <h3 className="bhc-label">YOUR PEAK HOUR</h3>

      {/* 3. Time Display */}
      <h1 className="bhc-time">{hour}</h1>

      {/* 4. Personality Text */}
      <h2 className="bhc-persona">{text}</h2>

      {/* 5. Description */}
      <p className="bhc-subtitle">
        This is when your inspiration strikes the hardest.
      </p>

    </NeonCardBase>
  );
}