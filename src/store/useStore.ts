import { create } from 'zustand';
import { Room, Participant, ChatMessage } from '../types';

interface AppState {
  user: any | null;
  room: Room | null;
  participants: Participant[];
  messages: ChatMessage[];
  isHost: boolean;
  setUser: (user: any | null) => void;
  setRoom: (room: Room | null) => void;
  setParticipants: (participants: Participant[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setIsHost: (isHost: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  room: null,
  participants: [],
  messages: [],
  isHost: false,
  setUser: (user) => set({ user }),
  setRoom: (room) => set({ room }),
  setParticipants: (participants) => set({ participants }),
  setMessages: (messages) => set({ messages }),
  setIsHost: (isHost) => set({ isHost }),
}));
