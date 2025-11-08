import { Hono } from "hono";
import { Env } from './core-utils';

export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Add more routes like this. **DO NOT MODIFY CORS OR OVERRIDE ERROR HANDLERS**
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'this works' }}));

    // Proxy endpoint for climate events API (adds CORS headers)
    app.get('/api/events', async (c) => {
        try {
            const response = await fetch('https://climate-events-min.qxc.workers.dev/events.json');
            if (!response.ok) {
                return c.json({ success: false, error: 'Failed to fetch events from external API' }, 502);
            }
            const data = await response.json();
            return c.json({ success: true, data });
        } catch (error) {
            console.error('Error fetching climate events:', error);
            return c.json({ success: false, error: 'Failed to fetch events' }, 500);
        }
    });
}
