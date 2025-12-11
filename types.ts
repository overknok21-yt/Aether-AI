export type Role = 'user' | 'model' | 'system';

export type MediaType = 'image' | 'video' | 'audio';

export interface MediaAttachment {
  type: MediaType;
  mimeType: string;
  data: string; // Base64
  url?: string; // For display
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  attachments?: MediaAttachment[];
  timestamp: number;
  isThinking?: boolean;
}

export type AppMode = 'flash' | 'detail';

export type NavSection = 'chat' | 'imagine';

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface ImageGenConfig {
  size: '1K' | '2K' | '4K';
  aspectRatio: '1:1' | '3:4' | '4:3' | '16:9' | '9:16';
}