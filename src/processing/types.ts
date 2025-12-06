/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Message {
  id: string;
  author: { role: 'user' | 'assistant' | 'system' | 'tool' };
  content: {
    content_type: string;
    parts?: (string | any)[];
  };
  create_time?: number;
  metadata?: {
    is_visually_hidden_from_conversation?: boolean;
  };
}

export interface Conversation {
  id: string;
  title: string;
  create_time: number;
  update_time: number;
  mapping: Record<string, { message?: Message }>;
}

export interface RewindStats {
  totalPrompts: number;
  totalWords: number;
  activeDays: number;
  totalConversations: number;
  avgPromptsPerDay: number;
  avgMessageLength: number;

  activityByDay: { day: string; count: number }[];
  activityByHour: { hour: string; count: number }[];

  busiestDay: string;
  busiestHour: string;

  topConversations: { title: string; messageCount: number }[];
  conversationSizes: { range: string; count: number }[];

  streakData: { date: string; count: number }[];
  heatmapData: { date: string; count: number }[];

  topTopics: { topic: string; count: number }[];

  voiceConversations: number;
  imageGenerations: number;
  fileUploads: number;
  multimodalUsage: { name: string; value: number }[];

  curiosityScore: number;
  nightOwlIndex: number;
  consistencyScore: number;
  productivityScore: number;

  monthlyTopics: { month: string; [topic: string]: number | string }[];
}