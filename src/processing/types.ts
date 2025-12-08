/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Message {
  id: string;
  author: { 
    role: 'user' | 'assistant' | 'system' | 'tool';
    name?: string; 
  };
  content: {
    content_type: string;
    parts?: (string | any)[];
    images?: any[]; 
  };
  create_time?: number;
  metadata?: {
    is_visually_hidden_from_conversation?: boolean;
    attachments?: any[]; 
    is_voice_message?: boolean;
    voice_mode_message?: boolean;
    modalities?: string[];
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
  totalCharacters: number;
  
  activeDays: number;
  totalConversations: number;
  avgPromptsPerDay: number;
  avgMessageLength: number; 
  avgCharLength: number;

  activityByDay: { day: string; count: number }[];
  activityByHour: { hour: string; count: number }[];

  // 1. The Day of the Week (e.g., "Monday")
  busiestDayOfWeek: string;

  // 2. The Specific Date (e.g., "2025-05-20") with deep dive details
  busiestDateOfTheYear: {
    date: string;
    count: number;
    conversations: { title: string; count: number }[];
  };
  
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