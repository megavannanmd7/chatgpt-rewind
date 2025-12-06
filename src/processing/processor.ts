import type { Conversation, RewindStats } from "./types";

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const START_2025 = new Date('2025-01-01T00:00:00Z').getTime();
const END_2025 = new Date('2025-12-31T23:59:59Z').getTime();

function normalize100(value: number, max: number): number {
  return Math.min(100, Math.round((value / max) * 100));
}

export function parseConversations(conversations: Conversation[]): RewindStats {
  let totalPrompts = 0;
  let totalWords = 0;

  const activeDaysSet = new Set<string>();
  const dayCount: Record<string, number> = {};
  const hourCount: Record<string, number> = {};
  const dateCount: Record<string, number> = {};

  const conversationStats: { title: string; messageCount: number }[] = [];
  const topicCount: Record<string, number> = {};

  let voiceConversations = 0;
  let imageGenerations = 0;
  let fileUploads = 0;

  // ------------------------------------------------------------
  // NEW — MONTHLY ANALYTICS
  // ------------------------------------------------------------
  const monthPromptMap: Record<string, number> = {};
  const monthTopicMap: Record<string, Record<string, number>> = {};
  const monthHourMap: Record<string, Record<string, number>> = {};

  // ------------------------------------------------------------
  // PROCESS EACH CONVERSATION
  // ------------------------------------------------------------
  conversations.forEach((conv) => {
    let convMessageCount = 0;

    Object.values(conv.mapping).forEach((node) => {
      const msg = node.message;
      if (!msg) return;
      if (msg.author?.role !== "user") return;
      if (msg.metadata?.is_visually_hidden_from_conversation) return;

      const parts = msg.content?.parts;
      if (!Array.isArray(parts) || parts.length === 0) return;

      const text = parts
        .map((p) => (typeof p === "string" ? p : ""))
        .join(" ")
        .trim();

      if (!text) return;

      if (msg.create_time) {
        const ts = msg.create_time * 1000;
        if (ts < START_2025 || ts > END_2025) return;
      } else return;

      // ------------------------------------------------------------
      // BASIC METRICS
      // ------------------------------------------------------------
      totalPrompts++;
      convMessageCount++;
      totalWords += text.split(/\s+/).filter(Boolean).length;

      const date = new Date(msg.create_time * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const monthKey = date.toISOString().slice(0, 7); // "2025-03"
      const dayName = DAYS[date.getDay()];
      const hourStr = HOURS[date.getHours()];

      // daily / weekly / hourly counts
      activeDaysSet.add(dateStr);
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
      hourCount[hourStr] = (hourCount[hourStr] || 0) + 1;
      dateCount[dateStr] = (dateCount[dateStr] || 0) + 1;

      // ------------------------------------------------------------
      // 🔥 NEW — Monthly prompt count
      // ------------------------------------------------------------
      monthPromptMap[monthKey] = (monthPromptMap[monthKey] || 0) + 1;

      // ------------------------------------------------------------
      // Topic extraction
      // ------------------------------------------------------------
      const titleWords = conv.title?.toLowerCase().split(/\s+/) || [];
      titleWords.forEach((w) => {
        if (w.length > 4) {
          topicCount[w] = (topicCount[w] || 0) + 1;

          // 🔥 NEW — Monthly topic count
          if (!monthTopicMap[monthKey]) monthTopicMap[monthKey] = {};
          monthTopicMap[monthKey][w] =
            (monthTopicMap[monthKey][w] || 0) + 1;
        }
      });

      // ------------------------------------------------------------
      // 🔥 NEW — Monthly hourly count
      // ------------------------------------------------------------
      if (!monthHourMap[monthKey]) monthHourMap[monthKey] = {};
      monthHourMap[monthKey][hourStr] =
        (monthHourMap[monthKey][hourStr] || 0) + 1;

      // ------------------------------------------------------------
      // Multimodal detection
      // ------------------------------------------------------------
      const ct = msg.content?.content_type || "";

      if (ct === "image_asset" || ct === "multimodal_text") {
        imageGenerations++;
      }

      if (ct === "audio") {
        voiceConversations++;
      }

      if (parts.some((p) => typeof p === "string" && p.includes("file"))) {
        fileUploads++;
      }
    });

    if (convMessageCount > 0) {
      conversationStats.push({
        title: conv.title || "Untitled",
        messageCount: convMessageCount,
      });
    }
  });

  // ------------------------------------------------------------
  // AGGREGATED METRICS (same as before)
  // ------------------------------------------------------------

  const activeDays = activeDaysSet.size;
  const avgPromptsPerDay = activeDays > 0 ? Math.round(totalPrompts / activeDays) : 0;
  const avgMessageLength = totalPrompts > 0 ? Math.round(totalWords / totalPrompts) : 0;

  const activityByDay = DAYS.map((d) => ({ day: d, count: dayCount[d] || 0 }));
  const activityByHour = HOURS.map((h) => ({ hour: h, count: hourCount[h] || 0 }));

  const busiestDay = activityByDay.reduce(
    (a, b) => (b.count > a.count ? b : a),
    { day: "N/A", count: 0 }
  ).day;

  const busiestHour = activityByHour.reduce(
    (a, b) => (b.count > a.count ? b : a),
    { hour: "N/A", count: 0 }
  ).hour;

  const topConversations = [...conversationStats]
    .sort((a, b) => b.messageCount - a.messageCount)
    .slice(0, 5);

  const sizeRanges = [
    { range: "1-5", min: 1, max: 5 },
    { range: "6-10", min: 6, max: 10 },
    { range: "11-20", min: 11, max: 20 },
    { range: "21-50", min: 21, max: 50 },
    { range: "50+", min: 51, max: Infinity },
  ];

  const conversationSizes = sizeRanges.map((r) => ({
    range: r.range,
    count: conversationStats.filter(
      (c) => c.messageCount >= r.min && c.messageCount <= r.max
    ).length,
  }));

  const heatmapData = Object.entries(dateCount).map(([date, count]) => ({ date, count }));

  const streakData = Object.entries(dateCount)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, count]) => ({ date, count }));

  const topTopics = Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }));

  const multimodalUsage = [
    { name: "Voice", value: voiceConversations },
    { name: "Images", value: imageGenerations },
    { name: "Files", value: fileUploads },
  ];

  // ------------------------------------------------------------
  // PERSONALITY SCORES (same)
  // ------------------------------------------------------------
  const nightMessages =
    hourCount["00:00"] +
    hourCount["01:00"] +
    hourCount["02:00"] +
    hourCount["03:00"] +
    hourCount["04:00"] ||
    0;

  const curiosityScore = normalize100(topTopics.length, 80);
  const nightOwlIndex = normalize100(nightMessages, totalPrompts || 1);
  const consistencyScore = normalize100(activeDays, 365);
  const productivityScore = normalize100(totalPrompts, 6000);

  // ------------------------------------------------------------
  // 🔥 FINAL: BUILD MONTHLY TOPIC SUMMARY
  // ------------------------------------------------------------
  const monthlyTopics = Object.keys(monthPromptMap).map((monthKey) => {
    const topicData = monthTopicMap[monthKey] || {};
    const hourData = monthHourMap[monthKey] || {};

    const topTopic =
      Object.entries(topicData)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    const busiestHour =
      Object.entries(hourData)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return {
      month: monthKey, // "2025-03"
      topTopic,
      busiestHour,
      prompts: monthPromptMap[monthKey] || 0,
    };
  });

  // ------------------------------------------------------------
  // RETURN FINAL
  // ------------------------------------------------------------
  return {
    totalPrompts,
    totalWords,
    activeDays,
    totalConversations: conversations.length,

    avgPromptsPerDay,
    avgMessageLength,

    activityByDay,
    activityByHour,

    busiestDay,
    busiestHour,

    topConversations,
    conversationSizes,

    streakData,
    heatmapData,
    topTopics,

    voiceConversations,
    imageGenerations,
    fileUploads,
    multimodalUsage,

    curiosityScore,
    nightOwlIndex,
    consistencyScore,
    productivityScore,

    monthlyTopics,
  };
}
