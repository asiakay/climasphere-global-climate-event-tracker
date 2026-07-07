CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  date_local TEXT,
  time_local TEXT,
  city       TEXT,
  country    TEXT,
  region     TEXT,
  host       TEXT,
  venue      TEXT,
  address    TEXT,
  link       TEXT,
  source     TEXT,
  tags       TEXT,
  fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date_local);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
