/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Conversation, RewindStats } from "./types";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

// STOP WORDS (Refined list)
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "your", "have", "are", 
  "was", "can", "you", "not", "but", "what", "all", "were", "when", "how", 
  "one", "will", "chatgpt", "openai", "please", "thanks", "hello", "about", 
  "into", "user", "assistant", "there", "their", "which", "would", "they", 
  "more", "some", "other", "using", "been", "also", "than", "should", "only",
  "write", "create", "make", "build", "generate", "explain", "help", "show", 
  "give", "find", "list", "need", "want", "check", "update", "change", "add", 
  "remove", "fix", "edit", "convert", "turn", "getting", "started", "working", 
  "using", "setting", "setup", "writing", "making", "doing", "optimize", 
  "improve", "review", "analyze", "format", "debug", "refactor", "best",
  "better", "good", "bad", "simple", "complex", "basic", "advanced",
  "guide", "tutorial", "overview", "summary", "explanation", "example", 
  "examples", "introduction", "conclusion", "intro", "part", "code", 
  "snippet", "script", "file", "files", "issue", "issues", "error", 
  "errors", "warning", "warnings", "solution", "solutions", "answer", 
  "answers", "question", "questions", "response", "request", "difference", 
  "comparison", "versus", "between", "documentation", "docs", "practice", 
  "practices", "step", "steps", "sure", "certainly", "here", "sorry",
  "assistance", "assist", "support", "visualize", "visualization", "design", 
  "redesign", "mode", "model", "conversation", "chat", "session", "expert",
  "implementation", "analysis", "learning", "explained"
]);

const START_2025 = new Date("2025-01-01T00:00:00Z").getTime();
const END_2025 = new Date("2025-12-31T23:59:59Z").getTime();

function normalize100(value: number, max: number): number {
  return Math.min(100, Math.round((value / max) * 100));
}

// --------------------------------------------------
// HELPER: GENERIC IMAGE DETECTION
// --------------------------------------------------
const isImageObject = (obj: any): boolean => {
  if (!obj || typeof obj !== "object") return false;
  return (
    obj.content_type === "image_asset" ||
    obj.content_type === "image_url" ||
    obj.type === "image" ||
    obj.asset_pointer?.startsWith("file-service://") ||
    obj.mime_type?.startsWith("image/") ||
    (typeof obj.url === "string" && (
      obj.url.startsWith("blob:") || 
      obj.url.includes("files.oaiusercontent.com") ||
      obj.url.match(/\.(png|jpg|jpeg|gif|webp)$/i)
    ))
  );
};

export function parseConversations(conversations: Conversation[]): RewindStats {
  let totalPrompts = 0;
  let totalWords = 0;
  let totalCharacters = 0;

  const activeDaysSet = new Set<string>();
  const dayCount: Record<string, number> = {};
  const hourCount: Record<string, number> = {};
  const dateCount: Record<string, number> = {};

  // For Busiest Date Detailed Analysis
  const dailyBreakdown: Record<string, Record<string, number>> = {};

  const conversationStats: { title: string; messageCount: number }[] = [];
  const topicCount: Record<string, number> = {};

  let voiceConversations = 0;
  let imageGenerations = 0;
  let fileUploads = 0;

  conversations.forEach((conv) => {
    let convUserMessageCount = 0;
    let has2025Activity = false;
    const title = conv.title || "Untitled";

    Object.values(conv.mapping).forEach((node) => {
      const msg = node.message;
      if (!msg || !msg.create_time) return;

      const ts = msg.create_time * 1000;
      if (ts < START_2025 || ts > END_2025) return;

      const role = msg.author?.role;
      const metadata = msg.metadata || {};
      const content = msg.content || {};
      const ct = content.content_type || "";

      // ==================================================
      // USER MESSAGES (Counts & Uploads)
      // ==================================================
      if (role === "user") {
        if (metadata.is_visually_hidden_from_conversation) return;

        has2025Activity = true;
        convUserMessageCount++;
        totalPrompts++;

        // WORD & CHAR COUNT
        const parts = content.parts || [];
        const text = parts
          .map((p) => (typeof p === "string" ? p : ""))
          .join(" ")
          .trim();

        if (text) {
          totalWords += text.split(/\s+/).filter(Boolean).length;
          totalCharacters += text.length; 
        }

        // DATE METRICS
        const date = new Date(ts);
        const dateStr = date.toISOString().split("T")[0]; // "2025-05-20"
        
        activeDaysSet.add(dateStr);
        dayCount[DAYS[date.getDay()]] = (dayCount[DAYS[date.getDay()]] || 0) + 1;
        hourCount[HOURS[date.getHours()]] = (hourCount[HOURS[date.getHours()]] || 0) + 1;
        dateCount[dateStr] = (dateCount[dateStr] || 0) + 1;

        // Daily Breakdown Logic 
        if (!dailyBreakdown[dateStr]) dailyBreakdown[dateStr] = {};
        dailyBreakdown[dateStr][title] = (dailyBreakdown[dateStr][title] || 0) + 1;

        // --------------------------------------------------
        // DETECT FILE UPLOADS
        // --------------------------------------------------
        if (Array.isArray(metadata.attachments) && metadata.attachments.length > 0) {
          fileUploads += metadata.attachments.length;
        } 
        else if (parts.some((p) => typeof p === "string" && (p.includes("file-service") || p.includes("files.oaiusercontent.com")))) {
          fileUploads++;
        }

        // --------------------------------------------------
        // DETECT VOICE INPUTS
        // --------------------------------------------------
        const hasAudio =
          ct === "audio" ||
          ct === "input_text_with_audio" ||
          metadata.is_voice_message === true ||
          metadata.voice_mode_message === true ||
          metadata.modalities?.includes("audio") ||
          (Array.isArray(content.parts) && content.parts.some((p: any) => p?.audio));

        if (hasAudio) voiceConversations++;
      }

      // ==================================================
      // ASSISTANT / TOOL MESSAGES (Detect Generated Images)
      // ==================================================
      if (role === "assistant" || role === "tool") {
        
        if (ct === "image_asset" || ct === "image_url") {
          imageGenerations++;
        }

        if (Array.isArray(content.parts)) {
          for (const part of content.parts) {
            if (isImageObject(part)) {
              imageGenerations++;
            }
            if (part && typeof part === 'object' && Array.isArray(part.results)) {
               part.results.forEach((res: any) => {
                 if (isImageObject(res)) imageGenerations++;
               });
            }
          }
        }

        if (Array.isArray((content as any).images)) {
          const imgs = (content as any).images.filter(isImageObject);
          imageGenerations += imgs.length;
        }

        if (Array.isArray(metadata.attachments)) {
          const imgs = metadata.attachments.filter(isImageObject);
          imageGenerations += imgs.length;
        }
      }
    });

    if (has2025Activity && convUserMessageCount > 0) {
      conversationStats.push({
        title: conv.title || "Untitled",
        messageCount: convUserMessageCount,
      });

      const titleWords = (conv.title || "").toLowerCase().split(/\s+/);
      titleWords.forEach((w) => {
        const clean = w.replace(/[^a-z0-9]/g, "");
        if (clean.length > 3 && !STOP_WORDS.has(clean)) {
          topicCount[clean] = (topicCount[clean] || 0) + 1;
        }
      });
    }
  });

  // ------------------------------------------------------------
  // AGGREGATION
  // ------------------------------------------------------------
  const activeDays = activeDaysSet.size;
  const avgPromptsPerDay = activeDays ? Math.round(totalPrompts / activeDays) : 0;
  const avgMessageLength = totalPrompts ? Math.round(totalWords / totalPrompts) : 0;
  const avgCharLength = totalPrompts ? Math.round(totalCharacters / totalPrompts) : 0;

  const activityByDay = DAYS.map((d) => ({ day: d, count: dayCount[d] || 0 }));
  const activityByHour = HOURS.map((h) => ({ hour: h, count: hourCount[h] || 0 }));

  // 1. Find Busiest Day of Week (e.g. "Monday")
  const busiestDayOfWeek = activityByDay.reduce((a, b) => (b.count > a.count ? b : a), { day: "N/A", count: 0 }).day;

  // 2. Find Busiest Hour
  const busiestHour = activityByHour.reduce((a, b) => (b.count > a.count ? b : a), { hour: "N/A", count: 0 }).hour;

  // 3. Find Busiest Date of Year (e.g. "2025-05-20")
  const busiestDateEntry = Object.entries(dateCount).reduce(
    (max, [date, count]) => (count > max.count ? { date, count } : max),
    { date: "N/A", count: 0 }
  );

  // Hydrate Busiest Date with Topic Details
  const busiestDateDetails = dailyBreakdown[busiestDateEntry.date] || {};
  const busiestDateConversations = Object.entries(busiestDateDetails)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3); // Top 3 conversations that day

  const busiestDateOfTheYear = {
    date: busiestDateEntry.date,
    count: busiestDateEntry.count,
    conversations: busiestDateConversations
  };

  const topConversations = [...conversationStats].sort((a, b) => b.messageCount - a.messageCount).slice(0, 5);

  const sizeRanges = [
    { range: "1-5", min: 1, max: 5 },
    { range: "6-10", min: 6, max: 10 },
    { range: "11-20", min: 11, max: 20 },
    { range: "21-50", min: 21, max: 50 },
    { range: "50+", min: 51, max: Infinity },
  ];

  const conversationSizes = sizeRanges.map((r) => ({
    range: r.range,
    count: conversationStats.filter((c) => c.messageCount >= r.min && c.messageCount <= r.max).length,
  }));

  const heatmapData = Object.entries(dateCount).map(([date, count]) => ({ date, count }));
  const streakData = Object.entries(dateCount)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, count]) => ({ date, count }));

  const topTopics = Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([topic, count]) => ({ topic, count }));

  const multimodalUsage = [
    { name: "Voice", value: voiceConversations },
    { name: "Images", value: imageGenerations },
    { name: "Files", value: fileUploads },
  ];

  const nightMessages =
    (hourCount["00:00"] || 0) + (hourCount["01:00"] || 0) + (hourCount["02:00"] || 0) +
    (hourCount["03:00"] || 0) + (hourCount["04:00"] || 0);
  
  const nightOwlIndex = normalize100(nightMessages * 3, totalPrompts || 1);
  const consistencyScore = normalize100(activeDays, 300);
  const productivityScore = normalize100(totalPrompts + conversationStats.length * 2, 4000);
  const curiosityScore = 0;

  const monthlyTopics: any[] = [];

  return {
    totalPrompts, totalWords, totalCharacters,
    activeDays, totalConversations: conversations.length,
    avgPromptsPerDay, avgMessageLength, avgCharLength,
    
    activityByDay, activityByHour,
    
    busiestDayOfWeek, // "Monday"
    busiestDateOfTheYear, // { date: "...", count: 120, conversations: [...] }
    busiestHour,

    topConversations, conversationSizes,
    streakData, heatmapData, topTopics,
    voiceConversations, imageGenerations, fileUploads, multimodalUsage,
    curiosityScore, nightOwlIndex, consistencyScore, productivityScore,
    monthlyTopics,
  };
}