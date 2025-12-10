import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { 
  Sparkles, ArrowLeft, MessageSquare, FileText, Calendar, 
  MessagesSquare, TrendingUp, Type, CalendarDays, Clock, 
  Flame, Mic, Image as ImageIcon, Upload, Film,
  Moon, Zap, Trophy 
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip,
  AreaChart, Area, CartesianGrid,
} from "recharts";
import { MetricCard } from "../../components/MetricCard/MetricCard";
import { ActivityHeatmap } from "../../components/ActivityMap/ActivityHeatmap";
import { InfoTooltip } from "../../components/InfoToolTip/InfoToolTip";
import "./Dashboard.css";
import type { RewindStats } from "../../processing/types";

const CHART_COLORS = {
  teal: "#2cc5a7",
  amber: "#f2c94c",
  muted: "#484f58",
  hoverBg: "#161b22"
};

export default function Dashboard() {
  const [stats, setStats] = useState<RewindStats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem("rewindStats");
    if (stored) {
      Promise.resolve().then(() => setStats(JSON.parse(stored)));
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

  // Calculate Max for Word Cloud Scaling
  const maxTopicCount = Math.max(...stats.topTopics.map(t => t.count), 1);

  return (
    <div className="dashboard-page">
      <header className="dash-header">
        <div className="dash-left">
          <span className="dot" />
          <span className="brand">Rewind '25</span>
        </div>
        <div className="dash-header-nav">
          <button className="back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
          <Link to="/wrapped" className="back-btn">
            <Film size={16} />
            <span>View Wrapped Story</span>
          </Link>
        </div>
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

        {/* 1. Hero Metrics */}
        <section className="hero-metrics">
          <MetricCard title="Total Prompts" value={stats.totalPrompts} icon={MessageSquare} highlight infoText="Total number of prompts sent in 2025." />
          <MetricCard title="Total Tokens" value={stats.totalWords} icon={FileText} infoText="A token is a small piece of text (a word or part of a word) that an AI model uses to read and understand your input. Here, for Eg: 'int a = 18', There're 4 tokens, they're 'int','a','=','18'." />
          <MetricCard title="Active Days" value={stats.activeDays} icon={Calendar} infoText="Days you used ChatGPT this year." />
          <MetricCard title="Conversations" value={stats.totalConversations} icon={MessagesSquare} infoText="Total conversation opened this year." />
          <MetricCard title="Avg / Day" value={stats.avgPromptsPerDay} icon={TrendingUp} infoText="Prompts per active day." />
          <MetricCard title="Avg Length" value={stats.avgMessageLength} icon={Type} subtitle="tokens" infoText="Average tokens per prompt." />
        </section>

        {/* 2. Heatmap */}
        <section className="heatmap-wrap">
          <ActivityHeatmap data={stats.heatmapData} />
        </section>

        {/* 3. Behavioral Patterns */}
        <section className="section">
          <div className="section-header">
            <div className="section-title-left">
              <div className="section-icon"><Flame size={20} /></div>
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
                <InfoTooltip content="Total prompts grouped by weekday." />
              </div>
              <div className="chart-area">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.activityByDay}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8b949e", fontSize: 12 }} dy={10} />
                    <YAxis hide />
                    <ReTooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}
                      itemStyle={{ color: '#e6edf3' }}
                    />
                    <Bar dataKey="count" fill={CHART_COLORS.teal} radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card chart-card">
              <div className="card-head">
                <div className="dot-amber" />
                <h3>Activity by Hour</h3>
                <InfoTooltip content="Activity breakdown by time of day." />
              </div>
              <div className="chart-area">
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={stats.activityByHour}>
                    <defs>
                      <linearGradient id="hourGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "#8b949e", fontSize: 12 }} dy={10} />
                    <YAxis hide />
                    <ReTooltip 
                      contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}
                      itemStyle={{ color: '#e6edf3' }}
                    />
                    <Area type="monotone" dataKey="count" stroke={CHART_COLORS.amber} strokeWidth={2} fill="url(#hourGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon"><CalendarDays size={24} /></div>
              <div className="stat-content">
                <div>
                  <p className="muted small">Busiest Day</p>
                  <p className="large">{stats.busiestDayOfWeek}</p>
                </div>
                <div className="badge">Peak Activity</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                 <InfoTooltip content="Day of the week with highest volume." />
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon alt"><Clock size={24} /></div>
              <div className="stat-content">
                <div>
                  <p className="muted small">Busiest Hour</p>
                  <p className="large">{stats.busiestHour}</p>
                </div>
                <div className="badge amber">Most Active</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                 <InfoTooltip content="Most active time of day." />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Personality Scores */}
        <section className="section">
           <div className="section-header">
            <div className="section-title-left">
              <div className="section-icon alt"><Trophy size={20} /></div>
              <div>
                <h2>Your Persona</h2>
                <p className="muted">How you interact with AI</p>
              </div>
            </div>
          </div>

          <div className="score-grid">
            <div className="card score-card">
              <div className="score-icon-box"><Moon size={24} /></div>
              <div className="score-info">
                <h4>Night Owl Index</h4>
                <div>
                  <span className="score-value">{stats.nightOwlIndex}</span>
                  <span className="score-suffix">/ 100</span>
                </div>
              </div>
            </div>

            <div className="card score-card">
              <div className="score-icon-box"><Zap size={24} /></div>
              <div className="score-info">
                <h4>Consistency</h4>
                <div>
                  <span className="score-value">{stats.consistencyScore}</span>
                  <span className="score-suffix">/ 100</span>
                </div>
              </div>
            </div>

            <div className="card score-card">
              <div className="score-icon-box"><TrendingUp size={24} /></div>
              <div className="score-info">
                <h4>Productivity</h4>
                <div>
                  <span className="score-value">{stats.productivityScore}</span>
                  <span className="score-suffix">/ 100</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Conversation Intelligence */}
        <section className="section">
          <div className="section-header">
            <div className="section-title-left">
              <div className="section-icon alt"><MessagesSquare size={20} /></div>
              <div>
                <h2>Conversation Intelligence</h2>
                <p className="muted">Deep dive into your conversations</p>
              </div>
            </div>
          </div>

          <div className="two-col-grid">
            <div className="card list-card">
              <div className="card-head">
                 <h3>Top 5 Longest Conversations</h3>
                 <InfoTooltip content="Longest threads by message count." />
              </div>
              <div className="list">
                {stats.topConversations.map((c, i) => (
                  <div key={i} className="list-item">
                    <div className="rank">{i + 1}</div>
                    <div className="title">{c.title}</div>
                    <div className="count">{c.messageCount}</div>
                  </div>
                ))}
              </div>
            </div>

<div className="card busiest-date-card">
  <div className="card-head">
    <h3>Busiest Date of the Year</h3>
    <InfoTooltip content="Your highest activity date with conversation breakdown." />
  </div>

  {/* Big date display */}
  <div className="busiest-date-hero">
    <div className="bd-date">
      {new Date(stats.busiestDateOfTheYear.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </div>

    <div className="bd-count">
      <span className="number">{stats.busiestDateOfTheYear.count}</span>
      <span className="label">messages</span>
    </div>
  </div>

  {/* Dynamic subtitle */}
  <p className="bd-subtitle">
    Your top {stats.busiestDateOfTheYear.conversations.slice(0, 2).length > 1 ? "2 conversations that day were" : "conversation that day was"}
  </p>

  {/* Top conversations */}
  <div className="list">
    {stats.busiestDateOfTheYear.conversations.slice(0, 2).map((c, i) => (
      <div key={i} className="list-item">
        <div className="rank">{i + 1}</div>
        <div className="title">{c.title}</div>
        <div className="count">{c.count}</div>
      </div>
    ))}
  </div>
</div>



            <div className="card streak-card col-span-2">
               <div className="card-head">
                  <h3>Activity Streak (Last 30 Days)</h3>
                  <InfoTooltip content="Daily prompt volume over the last month." />
               </div>
              <div style={{ height: 160, marginTop: 10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.streakData}>
                    <defs>
                      <linearGradient id="streakGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.teal} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.teal} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={{ fill: "#8b949e", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <ReTooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="count" stroke={CHART_COLORS.teal} strokeWidth={2} fill="url(#streakGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Content Stats (Word Cloud) */}
        <section className="section">
          <div className="section-header">
            <div className="section-title-left">
              <div className="section-icon"><FileText size={20} /></div>
              <div>
                <h2>Content Stats</h2>
                <p className="muted">What you talked about most</p>
              </div>
            </div>
          </div>

          <div className="card wordcloud">
            <div className="card-head">
                <h3>Word Cloud</h3>
                <InfoTooltip content="Most frequent keywords in your titles." />
            </div>
            <div className="wordcloud-container">
              {stats.topTopics.slice(0, 20).map((t, i) => {
                const size = 0.9 + (t.count / maxTopicCount) * 1.8; 
                const opacity = 0.5 + (t.count / maxTopicCount) * 0.5;
                const color = i % 2 === 0 ? CHART_COLORS.teal : CHART_COLORS.amber;
                
                return (
                  <span 
                    key={t.topic} 
                    className="wc-word"
                    style={{ 
                      fontSize: `${size}rem`, 
                      color: color,
                      opacity: opacity,
                      fontWeight: t.count > maxTopicCount * 0.5 ? 700 : 400
                    }}
                    title={`${t.count} times`}
                  >
                    {t.topic}
                  </span>
                )
              })}
            </div>
          </div>
        </section>

        {/* 7. Multimodal Usage */}
        <section className="section">
          <div className="section-header">
            <div className="section-title-left">
              <div className="section-icon alt"><Mic size={20} /></div>
              <div>
                <h2>Multimodal Usage</h2>
                <p className="muted">Beyond text conversations</p>
              </div>
            </div>
          </div>

          <div className="multimodal-grid">
            <MetricCard 
              title="Voice Chats" 
              value={stats.voiceConversations} 
              icon={Mic} 
              infoText="Number of conversations started via Voice Mode." 
            />
            
            <MetricCard 
              title="File Uploads" 
              value={stats.fileUploads} 
              icon={Upload} 
              infoText="Count of files uploaded for analysis." 
            />

            {/* CONDITIONAL RENDER: Only shows if images > 0 */}
            {stats.imageGenerations > 0 && (
              <MetricCard 
                title="Image Gens" 
                value={stats.imageGenerations} 
                icon={ImageIcon} 
                infoText="DALL-E image generations found in your history." 
              />
            )}
          </div>
        </section>

      </main>

      <footer className="dash-footer">
        <div>ChatGPT Rewind 2025 • All data processed locally</div>
        <div>  </div>
      </footer>
    </div>
  );
}