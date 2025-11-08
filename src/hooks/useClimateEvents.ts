import { useCallback } from 'react';
import { useEventsStore } from '@/store/eventsStore';
import type { ClimateEvent } from '@/types';
const API_URL = '/api/events';
const MOCK_EVENTS: ClimateEvent[] = [
    { title: "2026 UN Climate Change Conference (COP31)", address: "Sharm El Sheikh, Egypt", city: "Sharm El Sheikh", date_local: "2026-11-06", time_local: "09:00" },
    { title: "Global Renewable Energy Summit", address: "Dubai, UAE", city: "Dubai", date_local: "2026-03-22", time_local: "10:00" },
    { title: "Urban Sustainability Workshop", address: "London, UK", city: "London", date_local: "2026-05-10", time_local: "14:00" },
    { title: "Local Beach Cleanup Initiative", address: "Santa Monica, CA, USA", city: "Santa Monica", date_local: "2026-07-18", time_local: "08:00" }
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
            const result = await response.json();

            // Handle the wrapped response from our proxy
            const data = result.success ? result.data : result;

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