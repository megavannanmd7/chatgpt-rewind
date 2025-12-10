/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Home, LayoutDashboard } from "lucide-react";
import "./WrappedPage.css";
import type { RewindStats } from "../../../processing";
import { WelcomeCard } from "../Welcome/WelcomeCard";
import TotalPromptsCard from "../TotalPrompts/TotalPromptsCard";
import ActiveDaysCard from "../ActiveDaysCard/ActiveDaysCard";
import TotalConversationsCard from "../TotalConversations/TotalConversationsCard";
import BusiestHourCard from "../BusiestHourCard/BusiestHourCard";
import TotalWordsCard from "../TotalWordsCard/TotalWordsCard";
import BusiestDateCard from "../BusiestDateCard/BusiestDateCard";
import MostProductiveDayCard from "../MostProductiveDayCard/MostProductiveDayCard";
import WordCloudCard from "../WordCloudCard/WordCloudCard";
import { SummaryCard } from "../Summary/SummaryCard"; 

interface WrappedPageProps {
  stats?: RewindStats;
}

export function WrappedPage({ stats: propsStats }: WrappedPageProps) {
  const [stats, setStats] = useState<RewindStats | null>(propsStats ?? null);
  const [index, setIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef<number | null>(null);
  const currentTranslate = useRef<number>(0);
  const animating = useRef(false);
  const lastTouchTime = useRef<number>(0);

  useEffect(() => {
    if (stats) return;
    const raw = sessionStorage.getItem("rewindStats");
    if (raw) {
      try {
        setStats(JSON.parse(raw));
      } catch {
        // Handle error
      }
    }
  }, []);

  // --- Keyboard Support Added Here ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, stats]); // Depend on index/stats so next/prev work correctly

  // Calculate busiest day count safely
  const busiestDayCount = stats?.activityByDay.find(
    (d) => d.day === stats.busiestDayOfWeek
  )?.count || 0;

  const cards = stats
    ? [
        <WelcomeCard key="welcome" />,
        <TotalPromptsCard 
            key="tp" 
            totalPrompts={stats.totalPrompts} 
            avgPromptsPerDay={stats.avgPromptsPerDay} 
        />,
        <ActiveDaysCard key="ad" days={stats.activeDays} />,
        <TotalConversationsCard 
          key="top" 
          convos={stats.topConversations} 
          totalConversations={stats.totalConversations} 
        />,
        <BusiestHourCard key="hour" hour={stats.busiestHour} />,
        <TotalWordsCard 
          key="words" 
          totalWords={stats.totalWords} 
          totalCharacters={stats.totalCharacters} 
        />,
        <BusiestDateCard 
          key="date" 
          busiestDate={stats.busiestDateOfTheYear} 
        />,
        <MostProductiveDayCard 
          key="mpd" 
          day={stats.busiestDayOfWeek} 
          count={busiestDayCount} 
        />,
        <WordCloudCard key="cloud" topics={stats.topTopics} />,
        <SummaryCard key="sum" stats={stats} /> // Added Summary
      ]
    : [];

  const count = cards.length;

  const setIndexSafe = (i: number) =>
    setIndex(Math.max(0, Math.min(count - 1, i)));

  const goNext = () => setIndexSafe(index + 1);
  const goPrev = () => setIndexSafe(index - 1);

  // Animation Logic (Unchanged)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || count === 0) return;
    const width = el.clientWidth;
    animating.current = true;
    el.style.transition = "transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1)";
    el.style.transform = `translateX(${-index * width}px)`;
    const t = setTimeout(() => (animating.current = false), 400);
    return () => clearTimeout(t);
  }, [index, count]);

  // Touch Logic (Unchanged)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || count === 0) return;
    const width = el.clientWidth;
    const threshold = width * 0.2;

    const handleDown = (e: PointerEvent) => {
      if (animating.current) return;
      startX.current = e.clientX;
      currentTranslate.current = -index * width;
      lastTouchTime.current = Date.now();
      el.style.transition = "none";
    };

    const handleMove = (e: PointerEvent) => {
      if (startX.current === null) return;
      const dx = e.clientX - startX.current;
      el.style.transform = `translateX(${currentTranslate.current + dx}px)`;
    };

    const handleUp = (e: PointerEvent) => {
      if (startX.current === null) return;
      const dx = e.clientX - startX.current;
      const duration = Date.now() - lastTouchTime.current;
      startX.current = null;
      el.style.transition = "transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1)";
      if ((Math.abs(dx) > threshold) || (Math.abs(dx) > 20 && duration < 200)) {
        if (dx > 0) goPrev(); else goNext();
      } else {
        el.style.transform = `translateX(${-index * width}px)`;
      }
    };

    el.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      el.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [index, count]);

  if (!stats) {
    return <div className="wrapped-loading">Loading your Rewind...</div>;
  }


  return (
    <>
<div className="wrapped-nav-links">
  {/* Desktop buttons */}
  <Link to="/dashboard" className="nav-btn-link desktop-only">
    <span>Dashboard</span>
  </Link>

  <Link to="/" className="nav-btn-link desktop-only">
    <span>Home</span>
  </Link>

  {/* Mobile: icon-only buttons */}
  <Link to="/" className="nav-icon-btn mobile-only home-btn">
    <Home size={20} />
  </Link>

  <Link to="/dashboard" className="nav-icon-btn mobile-only dashboard-btn">
    <LayoutDashboard size={20} />
  </Link>
</div>


    <div className="wrapped-page">

      <div className="story-progress">
        {cards.map((_, i) => (
          <div key={i} className="progress-segment">
            <div className={`progress-fill ${i < index ? "completed" : i === index ? "active" : "pending"}`} />
          </div>
        ))}
      </div>

      <div className="wrapped-viewport">
        <div className="wrapped-carousel" ref={containerRef}>
          {cards.map((card, i) => (
            <div key={i} className={`wrapped-slide ${i === index ? "active-card" : ""}`}>
              <div className="wrapped-card-inner">
                {card}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons: Fixed position close to card */}
      <button className="nav-btn left" onClick={goPrev} disabled={index === 0}>←</button>
      <button className="nav-btn right" onClick={goNext} disabled={index === count - 1}>→</button>
    </div>
    </>
  );
}

export default WrappedPage;