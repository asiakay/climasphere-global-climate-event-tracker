import { create } from 'zustand';
import type { ClimateEvent } from '@/types';
import type { FilterValues } from '@/lib/filterSchema';

interface EventsState {
  events: ClimateEvent[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  isFallback: boolean;
  filters: FilterValues;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setEvents: (events: ClimateEvent[], isFallback: boolean) => void;
  setFilters: (filters: FilterValues) => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  isLoading: true,
  error: null,
  lastUpdated: null,
  isFallback: false,
  filters: {},
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
  setFilters: (filters) => set({ filters }),
}));

// --- Pure derived selectors ---

export function selectFilteredEvents(events: ClimateEvent[], filters: FilterValues): ClimateEvent[] {
  let result = events;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(e =>
      [e.title, e.host, e.city, e.address, e.venue]
        .some(f => f?.toLowerCase().includes(q))
    );
  }

  if (filters.dateFrom) {
    result = result.filter(e => !e.date_local || e.date_local >= filters.dateFrom!);
  }

  if (filters.dateTo) {
    result = result.filter(e => !e.date_local || e.date_local <= filters.dateTo!);
  }

  if (filters.cities && filters.cities.length > 0) {
    result = result.filter(e => e.city && filters.cities!.includes(e.city));
  }

  if (filters.tags && filters.tags.length > 0) {
    result = result.filter(e =>
      e.tags && e.tags.some(t => filters.tags!.includes(t))
    );
  }

  return result;
}

export function selectEventsByMonth(events: ClimateEvent[]): { month: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const e of events) {
    if (!e.date_local) continue;
    const month = e.date_local.slice(0, 7); // "YYYY-MM"
    counts[month] = (counts[month] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }),
      count,
    }));
}

export function selectEventsByCity(events: ClimateEvent[]): { city: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const e of events) {
    const city = e.city || 'Unknown';
    counts[city] = (counts[city] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([city, count]) => ({ city, count }));
}

export function selectEventsByTag(events: ClimateEvent[]): { tag: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const e of events) {
    for (const tag of e.tags ?? []) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));
}

export function selectStats(events: ClimateEvent[]): {
  total: number;
  upcomingThisMonth: number;
  countries: number;
} {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const upcomingThisMonth = events.filter(e => e.date_local?.startsWith(thisMonth)).length;
  const countries = new Set(
    events.map(e => e.country || e.city || '').filter(Boolean)
  ).size;
  return { total: events.length, upcomingThisMonth, countries };
}
