import { useCallback } from 'react';
import { useEventsStore } from '@/store/eventsStore';
import type { ClimateEvent } from '@/types';
const API_URL = 'https://climate-events-min.qxc.workers.dev/events.json';
const MOCK_EVENTS: ClimateEvent[] = [
    { title: "2026 UN Climate Change Conference (COP31)", address: "Sharm El Sheikh, Egypt", date: "2026-11-06T00:00:00Z" },
    { title: "Global Renewable Energy Summit", address: "Dubai, UAE", date: "2026-03-22T00:00:00Z" },
    { title: "Urban Sustainability Workshop", address: "London, UK", date: "2026-05-10T00:00:00Z" },
    { title: "Local Beach Cleanup Initiative", address: "Santa Monica, CA, USA", date: "2026-07-18T00:00:00Z" }
];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return response;
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                if (i < maxRetries - 1) {
                    const delayTime = 2 ** i * 1000;
                    await delay(delayTime);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }
    }
    throw new Error('Failed to fetch after multiple retries.');
}
export function useClimateEvents() {
    const setLoading = useEventsStore(state => state.setLoading);
    const setEvents = useEventsStore(state => state.setEvents);
    const setError = useEventsStore(state => state.setError);
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetchWithRetry(API_URL);
            const data = await response.json();
            if (Array.isArray(data)) {
                setEvents(data, false);
            } else {
                throw new Error("Invalid data structure from API.");
            }
        } catch (error) {
            console.error('Error fetching climate events:', error);
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                setError(`Network connection failed. Displaying static fallback data.`);
                setEvents(MOCK_EVENTS, true);
            } else if (error instanceof Error) {
                setError(error.message);
                setEvents([], true); // Clear events on other errors
            } else {
                setError('An unknown error occurred.');
                setEvents([], true);
            }
        }
    }, [setLoading, setEvents, setError]);
    return { fetchEvents };
}