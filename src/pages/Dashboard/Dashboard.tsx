import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sparkles, ArrowLeft, MessageSquare, FileText, Calendar, MessagesSquare, TrendingUp, Type, CalendarDays, Clock, Flame, Mic, Image, Upload } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { MetricCard } from "../../components/MetricCard/MetricCard";
import { ActivityHeatmap } from "../../components/ActivityMap/ActivityHeatmap";
import { InfoTooltip } from "../../components/InfoTooltip/InfoTooltip";
import PrivacyBanner from "../../components/PrivacyBanner/PrivacyBanner";

import "./Dashboard.css";

// fallback generator - use your real generator if you have it
import type { RewindStats } from "../../processing/types";

const CHART_COLORS = {
  teal: "hsl(166, 63%, 47%)",
  amber: "hsl(41, 87%, 62%)",
  muted: "hsl(212, 10%, 58%)",
};
const PIE_COLORS = [CHART_COLORS.teal, CHART_COLORS.amber, "hsl(200,50%,50%)"];

export default function Dashboard() {
  const [stats, setStats] = useState<RewindStats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem("rewindStats");
    if (stored) {
      // avoid React/ESLint setState-in-effect warning
      Promise.resolve().then(() => setStats(JSON.parse(stored)));
    } else {
      // fallback to mock
    //   setStats(generateMockStats());
    }
  }, []);

  if (!stats) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p className="muted">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <PrivacyBanner />

      <header className="dash-header">
        <div className="dash-left">
          <span className="dot" />
          <span className="brand">Rewind '25</span>
        </div>
        <button className="back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
      </header>

      <main className="dash-main container">
        <div className="title-block">
          <div className="badge">
            <Sparkles size={14} />
            <span>Your 2025 Stats</span>
          </div>
          <h1 className="title">
            Your Year at a <span className="glance">Glance</span>
          </h1>
          <p className="subtitle">Discover your ChatGPT journey this year</p>
        </div>

        {/* HERO METRICS */}
        <section className="hero-metrics">
          <MetricCard title="Total Prompts" value={stats.totalPrompts} icon={MessageSquare} highlight infoText="Total number of prompts you sent in 2025" />
          <MetricCard title="Total Words" value={stats.totalWords} icon={FileText} infoText="Sum of all words across prompts" />
          <MetricCard title="Active Days" value={stats.activeDays} icon={Calendar} infoText="Unique days with activity in 2025" />
          <MetricCard title="Conversations" value={stats.totalConversations} icon={MessagesSquare} infoText="Total conversation threads" />
          <MetricCard title="Avg / Day" value={stats.avgPromptsPerDay} icon={TrendingUp} infoText="Average prompts per active day" />
          <MetricCard title="Avg Length" value={stats.avgMessageLength} icon={Type} subtitle="words" infoText="Average words per prompt" />
        </section>

        {/* HEATMAP */}
        <section className="heatmap-wrap">
          <ActivityHeatmap data={stats.heatmapData} />
        </section>

        {/* BEHAVIORAL PATTERNS */}
        <section className="section">
          <div className="section-header">
            <div className="section-title-left">
              <div className="section-icon"><Flame size={18} /></div>
              <div>
                <h2>Behavioral Patterns</h2>
                <p className="muted">Your usage trends and habits</p>
              </div>
            </div>
          </div>

          <div className="two-col-grid">
            <div className="card chart-card">
              <div className="card-head">
                <div className="dot-teal" />
                <h3>Activity by Day of Week</h3>
                <InfoTooltip content="Total prompts grouped by weekday (Mon..Sun)" />
              </div>
              <div className="chart-area">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.activityByDay}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted }} />
                    <YAxis hide />
                    <ReTooltip wrapperStyle={{ background: "#0f1720", borderRadius: 10 }} />
                    <Bar dataKey="count" fill={CHART_COLORS.teal} radius={[8,8,0,0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card chart-card">
              <div className="card-head">
                <div className="dot-amber" />
                <h3>Activity by Hour</h3>
                <InfoTooltip content="Prompts distributed across 24 hours (local time)." />
              </div>
              <div className="chart-area">
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={stats.activityByHour}>
                    <defs>
                      <linearGradient id="hourGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.28}/>
                        <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted }} />
                    <YAxis hide />
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#122024" />
                    <ReTooltip wrapperStyle={{ background: "#0f1720", borderRadius: 10 }} />
                    <Area type="monotone" dataKey="count" stroke={CHART_COLORS.amber} strokeWidth={2} fill="url(#hourGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Busiest Day + Hour */}
            <div className="card stat-card">
              <div className="stat-left">
                <div className="stat-icon"><CalendarDays size={20} /></div>
                <div>
                  <p className="muted small">Busiest Day</p>
                  <p className="large">{stats.busiestDay}</p>
                </div>
              </div>
              <div className="badge">Peak</div>
            </div>

            <div className="card stat-card">
              <div className="stat-left">
                <div className="stat-icon alt"><Clock size={20} /></div>
                <div>
                  <p className="muted small">Busiest Hour</p>
                  <p className="large">{stats.busiestHour}</p>
                </div>
              </div>
              <div className="badge amber">Most Active</div>
            </div>
          </div>
        </section>

        {/* CONVERSATION INTELLIGENCE */}
        <section className="section">
          <div className="section-header">
            <div className="section-title-left">
              <div className="section-icon alt"><MessagesSquare size={18} /></div>
              <div>
                <h2>Conversation Intelligence</h2>
                <p className="muted">Deep dive into your conversations</p>
              </div>
            </div>
          </div>

          <div className="two-col-grid">
            <div className="card list-card">
              <h3>Top 5 Longest Conversations</h3>
              <div className="list">
                {stats.topConversations.map((c, i) => (
                  <div key={c.title} className="list-item">
                    <div className="rank">{i+1}</div>
                    <div className="title">{c.title}</div>
                    <div className="count">{c.messageCount}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card chart-card">
              <h3>Conversation Sizes</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.conversationSizes}>
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.muted }} />
                  <YAxis hide />
                  <ReTooltip wrapperStyle={{ background: "#0f1720", borderRadius: 10 }} />
                  <Bar dataKey="count" fill={CHART_COLORS.teal} radius={[8,8,0,0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card streak-card">
              <h3>Activity Streak (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={stats.streakData}>
                  <defs>
                    <linearGradient id="streakGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.teal} stopOpacity={0.28}/>
                      <stop offset="95%" stopColor={CHART_COLORS.teal} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#122024" />
                  <XAxis dataKey="date" tickFormatter={(d)=>d.slice(5)} tick={{ fill: CHART_COLORS.muted }} axisLine={false} />
                  <YAxis hide />
                  <ReTooltip wrapperStyle={{ background: "#0f1720", borderRadius: 10 }} />
                  <Area type="monotone" dataKey="count" stroke={CHART_COLORS.teal} strokeWidth={2} fill="url(#streakGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* CONTENT + MULTIMODAL */}
        <section className="section">
          <div className="section-header">
            <div className="section-title-left">
              <div className="section-icon"><FileText size={18} /></div>
              <div>
                <h2>Content Stats</h2>
                <p className="muted">What you talked about most</p>
              </div>
            </div>
          </div>

          <div className="two-col-grid">
            <div className="card topic-card">
              <h3>Top Topics</h3>
              <div className="topics">
                {stats.topTopics.map((t, i) => (
                  <span key={t.topic} className={`topic-pill ${i===0?'primary':i===1?'accent':''}`}>
                    {t.topic} <span className="count">{t.count}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="card wordcloud">
              <h3>Word Cloud</h3>
              <div className="wordcloud-inner">
                {stats.topTopics.slice(0, 6).map((t, i) => (
                  <span key={t.topic} style={{ fontSize: `${24 - i * 2}px`, color: i===0?CHART_COLORS.teal:i===1?CHART_COLORS.amber:'#9ba3ae' }}>{t.topic}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <div className="section-title-left">
              <div className="section-icon alt"><Mic size={18} /></div>
              <div>
                <h2>Multimodal Usage</h2>
                <p className="muted">Beyond text conversations</p>
              </div>
            </div>
          </div>

          <div className="multimodal-grid">
            <MetricCard title="Voice Chats" value={stats.voiceConversations} icon={Mic} />
            <MetricCard title="Image Gens" value={stats.imageGenerations} icon={Image} />
            <MetricCard title="File Uploads" value={stats.fileUploads} icon={Upload} />
            <div className="card donut-card">
              <h3>Distribution</h3>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={stats.multimodalUsage} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={4}>
                    {stats.multimodalUsage.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="legend">
                {stats.multimodalUsage.map((m, i) => (
                  <div key={m.name} className="legend-item"><span className="legend-dot" style={{ background: PIE_COLORS[i] }} />{m.name}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="dash-footer">
        <div>ChatGPT Rewind 2025 • All data processed locally</div>
      </footer>
    </div>
  );
}
