import type { ClimateEvent } from '@shared/types';

interface EventRow {
  id: number;
  title: string;
  date_local: string | null;
  time_local: string | null;
  city: string | null;
  country: string | null;
  region: string | null;
  host: string | null;
  venue: string | null;
  address: string | null;
  link: string | null;
  source: string | null;
  tags: string | null;
  fetched_at: string;
}

export async function getEventsFromDB(db: D1Database): Promise<ClimateEvent[]> {
  const { results } = await db
    .prepare('SELECT * FROM events ORDER BY date_local ASC')
    .all<EventRow>();
  return results.map(row => ({
    id: String(row.id),
    title: row.title,
    date_local: row.date_local ?? undefined,
    time_local: row.time_local ?? undefined,
    city: row.city ?? undefined,
    country: row.country ?? undefined,
    region: row.region ?? undefined,
    host: row.host ?? undefined,
    venue: row.venue ?? undefined,
    address: row.address ?? undefined,
    link: row.link ?? undefined,
    source: row.source ?? undefined,
    tags: row.tags ? (JSON.parse(row.tags) as string[]) : undefined,
  }));
}

export async function upsertEvents(db: D1Database, events: ClimateEvent[]): Promise<void> {
  await db.prepare('DELETE FROM events').run();
  if (events.length === 0) return;

  const stmt = db.prepare(
    `INSERT INTO events
      (title, date_local, time_local, city, country, region, host, venue, address, link, source, tags, fetched_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  );

  await db.batch(
    events.map(e =>
      stmt.bind(
        e.title,
        e.date_local ?? null,
        e.time_local ?? null,
        e.city ?? null,
        e.country ?? null,
        e.region ?? null,
        e.host ?? null,
        e.venue ?? null,
        e.address ?? null,
        e.link ?? null,
        e.source ?? null,
        e.tags ? JSON.stringify(e.tags) : null
      )
    )
  );
}

export async function isStale(db: D1Database, maxAgeMinutes = 60): Promise<boolean> {
  const row = await db
    .prepare("SELECT fetched_at FROM events ORDER BY fetched_at DESC LIMIT 1")
    .first<{ fetched_at: string }>();
  if (!row) return true;
  const age = (Date.now() - new Date(row.fetched_at + 'Z').getTime()) / 60_000;
  return age > maxAgeMinutes;
}
