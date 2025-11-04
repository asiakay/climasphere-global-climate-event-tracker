import { create } from 'zustand';
import type { ClimateEvent } from '@/types';
interface EventsState {
  events: ClimateEvent[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  isFallback: boolean;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setEvents: (events: ClimateEvent[], isFallback: boolean) => void;
}
export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  isLoading: true,
  error: null,
  lastUpdated: null,
  isFallback: false,
  setLoading: (isLoading) => set({ isLoading, error: null }),
  setError: (error) => set({ error, isLoading: false }),
  setEvents: (events, isFallback) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    set({
      events,
      isFallback,
      isLoading: false,
      error: null,
      lastUpdated: timeString,
    });
  },
}));