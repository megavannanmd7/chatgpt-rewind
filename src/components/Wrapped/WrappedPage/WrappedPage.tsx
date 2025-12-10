/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-empty */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Home, LayoutDashboard, Download, Share2 } from "lucide-react";
import html2canvas from "html2canvas";

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


export function WrappedPage({ stats: propsStats }: { stats?: RewindStats }) {

  const [stats, setStats] = useState<RewindStats | null>(propsStats ?? null);
  const [index, setIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef<number | null>(null);
  const currentTranslate = useRef<number>(0);
  const animating = useRef(false);
  const lastTouchTime = useRef<number>(0);


  // Load stats
  useEffect(() => {
    if (stats) return;
    const raw = sessionStorage.getItem("rewindStats");
    if (raw) {
      try {
        setStats(JSON.parse(raw));
      } catch {}
    }
  }, []);

  // Busiest day count
  const busiestDayCount =
    stats?.activityByDay.find((d) => d.day === stats.busiestDayOfWeek)?.count || 0;


  // Build Cards
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
          key="tc"
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

        // FINAL CARD (Summary)
        <SummaryCard key="summary" stats={stats} />
      ]
    : [];

  const count = cards.length;

  const setIndexSafe = (i: number) =>
    setIndex(Math.max(0, Math.min(count - 1, i)));

  const goNext = () => setIndexSafe(index + 1);
  const goPrev = () => setIndexSafe(index - 1);


  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index]);


  // Animate slides
  useEffect(() => {
    const el = containerRef.current;
    if (!el || count === 0) return;

    const width = el.clientWidth;
    animating.current = true;

    el.style.transition = "transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1)";
    el.style.transform = `translateX(${-index * width}px)`;

    const timeout = setTimeout(() => (animating.current = false), 400);
    return () => clearTimeout(timeout);
  }, [index, count]);


  // Touch navigation
  useEffect(() => {

    const el = containerRef.current;
    if (!el || count === 0) return;

    const width = el.clientWidth;
    const threshold = width * 0.2;

    const onDown = (e: PointerEvent) => {
      if (animating.current) return;

      startX.current = e.clientX;
      currentTranslate.current = -index * width;
      lastTouchTime.current = Date.now();

      el.style.transition = "none";
    };

    const onMove = (e: PointerEvent) => {
      if (startX.current === null) return;
      const dx = e.clientX - startX.current;
      el.style.transform = `translateX(${currentTranslate.current + dx}px)`;
    };

    const onUp = (e: PointerEvent) => {
      if (startX.current === null) return;

      const dx = e.clientX - startX.current;
      const duration = Date.now() - lastTouchTime.current;

      startX.current = null;
      el.style.transition = "transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1)";

      if (Math.abs(dx) > threshold || (Math.abs(dx) > 20 && duration < 200)) {
        dx > 0 ? goPrev() : goNext();
      } else {
        el.style.transform = `translateX(${-index * width}px)`;
      }
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

  }, [index, count]);


  // ---- SAVE / SHARE BUTTON LOGIC (needed only for final slide) ---- //

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My ChatGPT Rewind 2025",
          text: "I unlocked my 2025 AI stats!",
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleDownload = async () => {
    const element = document.querySelector(
      ".summary-card-standalone"
    ) as HTMLElement;

    if (!element) return;

    await new Promise((r) => setTimeout(r, 150));

    const width = element.offsetWidth;
    const targetWidth = 1080;
    const scale = targetWidth / width;

    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale,
      useCORS: true,
      scrollY: -window.scrollY,
    });

    const img = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = img;
    link.download = "chatgpt-rewind-2025-summary.png";
    link.click();
  };


  if (!stats) {
    return <div className="wrapped-loading">Loading your Rewind...</div>;
  }


  return (
    <>

      {/* Top Navigation */}
      <div className="wrapped-nav-links">

        <Link to="/dashboard" className="nav-btn-link desktop-only">
          Dashboard
        </Link>

        <Link to="/" className="nav-btn-link desktop-only">
          Home
        </Link>

        {/* Mobile Icon Buttons */}
        <Link to="/" className="nav-icon-btn mobile-only home-btn">
          <Home size={20} />
        </Link>

        <Link to="/dashboard" className="nav-icon-btn mobile-only dashboard-btn">
          <LayoutDashboard size={20} />
        </Link>
      </div>


      {/* Main Page */}
      <div className="wrapped-page">

        {/* Progress Bar */}
        <div className="story-progress">
          {cards.map((_, i) => (
            <div key={i} className="progress-segment">
              <div
                className={`progress-fill ${
                  i < index ? "completed"
                  : i === index ? "active"
                  : "pending"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Viewport */}
        <div className="wrapped-viewport">
          <div className="wrapped-carousel" ref={containerRef}>
            {cards.map((card, i) => (
              <div
                key={i}
                className={`wrapped-slide ${
                  i === index ? "active-card" : ""
                }`}
              >
                <div className="wrapped-card-inner">{card}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Prev / Next (hidden on mobile) */}
        <button className="nav-btn left" onClick={goPrev} disabled={index === 0}>
          ←
        </button>

        <button
          className="nav-btn right"
          onClick={goNext}
          disabled={index === count - 1}
        >
          →
        </button>


        {/* FIXED SAVE + SHARE BUTTONS — ONLY ON FINAL SLIDE */}
        {index === count - 1 && (
          <div className="summary-actions-fixed" data-html2canvas-ignore="true">
            <button className="sum-btn primary" onClick={handleDownload}>
              <Download size={18} /> Save
            </button>

            <button className="sum-btn secondary" onClick={handleShare}>
              <Share2 size={18} /> Share
            </button>
          </div>
        )}

      </div>
    </>
  );
}

export default WrappedPage;
