export interface Room {
  id: string;
  hostId: string;
  hostName: string;
  videoUrl?: string;
  videoTitle?: string;
  playing: boolean;
  currentTime: number;
  playbackRate: number;
  lastUpdatedBy: string;
  updatedAt: any; // Server Timestamp
}

export interface Participant {
  uid: string;
  displayName: string;
  joinedAt: any;
  lastSeen: any;
  status: 'online' | 'offline';
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  type: 'text' | 'system' | 'reaction';
  timestamp: any;
}

export interface SyncState {
  playing: boolean;
  currentTime: number;
  playbackRate: number;
  timestamp: number;
}
