import { Hono } from "hono";
import type { Env } from './env';
import type { ClimateEvent } from '@shared/types';
import { getEventsFromDB, upsertEvents, isStale } from './db';

const UPSTREAM_URL = 'https://climate-events-min.qxc.workers.dev/events.json';

async function fetchUpstream(): Promise<ClimateEvent[] | null> {
    const response = await fetch(UPSTREAM_URL);
    if (!response.ok) return null;
    return await response.json() as ClimateEvent[];
}

export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'this works' }}));

    app.get('/api/events', async (c) => {
        const db = c.env.DB;

        // D1 path: serve from cache when fresh, refresh when stale
        if (db) {
            if (!await isStale(db)) {
                const events = await getEventsFromDB(db);
                return c.json({ success: true, data: events, source: 'cache' });
            }
            try {
                const data = await fetchUpstream();
                if (data) {
                    await upsertEvents(db, data);
                    return c.json({ success: true, data, source: 'upstream' });
                }
                // Upstream failed — serve stale D1 data
                const stale = await getEventsFromDB(db);
                if (stale.length > 0) {
                    return c.json({ success: true, data: stale, source: 'stale-cache' });
                }
            } catch (error) {
                console.error('D1 path error:', error);
                // Fall through to direct proxy
            }
        }

        // Direct proxy fallback (no D1 or D1 error)
        try {
            const data = await fetchUpstream();
            if (!data) {
                return c.json({ success: false, error: 'Failed to fetch events from external API' }, 502);
            }
            return c.json({ success: true, data, source: 'upstream' });
        } catch (error) {
            console.error('Error fetching climate events:', error);
            return c.json({ success: false, error: 'Failed to fetch events' }, 500);
        }
    });

    // Force a cache refresh (only meaningful when D1 is configured)
    app.post('/api/events/refresh', async (c) => {
        const db = c.env.DB;
        try {
            const data = await fetchUpstream();
            if (!data) {
                return c.json({ success: false, error: 'Upstream fetch failed' }, 502);
            }
            if (db) {
                await upsertEvents(db, data);
            }
            return c.json({ success: true, count: data.length, source: 'upstream' });
        } catch (error) {
            console.error('Error refreshing events:', error);
            return c.json({ success: false, error: 'Refresh failed' }, 500);
        }
    });
}
