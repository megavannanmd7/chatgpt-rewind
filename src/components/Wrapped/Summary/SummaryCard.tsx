import { useRef, useState, useMemo } from "react";
import { Download, Share2, Sparkles, MessageSquare } from "lucide-react";
import type { RewindStats } from "../../../processing";
import "./SummaryCard.css";
import html2canvas from "html2canvas";

interface Props {
  stats: RewindStats;
}

export function SummaryCard({ stats }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const topConvo = stats.topConversations[0] || { title: "N/A", messageCount: 0 };

  const marqueeRows = useMemo(() => {
    const words = stats.topTopics.map(t => t.topic);
    if (words.length === 0) return [];
    const chunkSize = Math.ceil(words.length / 5);
    return Array.from({ length: 5 }, (_, i) => 
      words.slice(i * chunkSize, (i + 1) * chunkSize).join(" • ")
    );
  }, [stats.topTopics]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My ChatGPT Rewind 2025',
          text: `I unlocked my 2025 AI stats!`,
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
    if (!cardRef.current) return;
    setIsCapturing(true);

    try {
      await new Promise(r => setTimeout(r, 150));

      const elementWidth = cardRef.current.offsetWidth;
      const targetWidth = 1080; 
      const scaleFactor = targetWidth / elementWidth;

      const canvas = await html2canvas(cardRef.current, {
        // MATCH THE GRADIENT HERE for the download
        backgroundColor: null, // Transparent so the CSS gradient shines through
        scale: scaleFactor,
        useCORS: true,
        logging: false,
        scrollY: -window.scrollY,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "chatgpt-rewind-2025-summary.png";
      link.click();
    } catch (err) {
      console.error("Capture failed:", err);
      alert("Could not save image.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div 
      ref={cardRef} 
      className="summary-card-standalone"
      style={{
        // CHANGED: Colorful Gradient Background
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
        borderRadius: "0px",
        overflow: "hidden",
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        boxSizing: "border-box"
      }}
    >
      {/* 1. Marquee Background */}
      <div className="sum-marquee-container">
        {marqueeRows.map((text, i) => (
          <div 
            key={i} 
            className={`sum-marquee-row ${i % 2 === 0 ? 'scroll-left' : 'scroll-right'}`}
            style={{ 
              animationDuration: `${35 + i * 5}s`,
              opacity: 0.06 // Lower opacity so it doesn't clash with the colorful bg
            }}
          >
            {text} • {text} • {text} 
          </div>
        ))}
      </div>

      {/* 2. Spotlight - Adjusted to blend with new bg */}
      <div className="sum-spotlight" />

      {/* 3. Main Content */}
      <div 
        className="sum-content-layer"
        style={{
          flex: 1, 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly', 
          alignItems: 'center',
          gap: '16px' // Increased gap for better spacing
        }}
      >
        
        <div className="sum-header">
          <div className="sum-logo-box">
            <Sparkles size={24} className="sum-icon" strokeWidth={2.5} />
          </div>
          <h1>2025 UNLOCKED</h1>
        </div>

        <div className="sum-grid">
          <div className="sum-stat-box theme-purple">
            <label>PROMPTS</label>
            <span>{stats.totalPrompts.toLocaleString()}</span>
          </div>
          <div className="sum-stat-box theme-blue">
            <label>TOKENS</label>
            <span>{(stats.totalWords / 1000).toFixed(1)}k</span>
          </div>
          <div className="sum-stat-box theme-green">
            <label>ACTIVE DAYS</label>
            <span>{stats.activeDays}</span>
          </div>
          <div className="sum-stat-box theme-orange">
            <label>TOP HOUR</label>
            <span>{stats.busiestHour}</span>
          </div>
          
          <div className="sum-stat-box theme-red full-width">
            <label>MOST ACTIVE DAY</label>
            <span>{stats.busiestDayOfWeek}</span>
          </div>
        </div>

        <div className="sum-top-convo">
          <div className="sum-convo-label">
            <MessageSquare size={12} strokeWidth={3} />
            <span>LONGEST THREAD</span>
          </div>
          <h2 className="sum-convo-title">{topConvo.title}</h2>
          <p className="sum-convo-count">{topConvo.messageCount} messages</p>
        </div>

      </div>

      {/* 4. Footer Actions */}
      <div className="sum-actions" data-html2canvas-ignore="true">
        <button className="sum-btn primary" onClick={handleDownload} disabled={isCapturing}>
          <Download size={18} /> {isCapturing ? "Saving..." : "Save"}
        </button>
        <button className="sum-btn secondary" onClick={handleShare}>
          <Share2 size={18} /> Share
        </button>
      </div>

    </div>
  );
}