import { Hono } from "hono";
import type { Env } from './env';
import type { ClimateEvent } from '@shared/types';
import { getEventsFromDB, upsertEvents, isStale } from './db';

const UPSTREAM_URL = 'https://climate-events-min.qxc.workers.dev/events.json';

export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'this works' }}));

    app.get('/api/events', async (c) => {
        const db = c.env.DB;

        // Serve from D1 cache if fresh (< 60 min old)
        if (!await isStale(db)) {
            const events = await getEventsFromDB(db);
            return c.json({ success: true, data: events, source: 'cache' });
        }

        // Fetch fresh data from upstream
        try {
            const response = await fetch(UPSTREAM_URL);
            if (!response.ok) {
                // Upstream failed — return stale cache rather than erroring
                const staleEvents = await getEventsFromDB(db);
                if (staleEvents.length > 0) {
                    return c.json({ success: true, data: staleEvents, source: 'stale-cache' });
                }
                return c.json({ success: false, error: 'Failed to fetch events from external API' }, 502);
            }
            const data = await response.json() as ClimateEvent[];
            await upsertEvents(db, data);
            return c.json({ success: true, data, source: 'upstream' });
        } catch (error) {
            console.error('Error fetching climate events:', error);
            // On exception, attempt to serve stale cache
            try {
                const staleEvents = await getEventsFromDB(db);
                if (staleEvents.length > 0) {
                    return c.json({ success: true, data: staleEvents, source: 'stale-cache' });
                }
            } catch {
                // D1 also failed
            }
            return c.json({ success: false, error: 'Failed to fetch events' }, 500);
        }
    });

    // Force a cache refresh regardless of staleness
    app.post('/api/events/refresh', async (c) => {
        const db = c.env.DB;
        try {
            const response = await fetch(UPSTREAM_URL);
            if (!response.ok) {
                return c.json({ success: false, error: 'Upstream fetch failed' }, 502);
            }
            const data = await response.json() as ClimateEvent[];
            await upsertEvents(db, data);
            return c.json({ success: true, count: data.length, source: 'upstream' });
        } catch (error) {
            console.error('Error refreshing events:', error);
            return c.json({ success: false, error: 'Refresh failed' }, 500);
        }
    });
}
