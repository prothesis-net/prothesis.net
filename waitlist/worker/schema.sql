-- Prothesis waitlist (Cloudflare D1). Apply with: npx wrangler d1 execute prothesis-waitlist --remote --file=schema.sql

-- One row per email. The consent record is the words shown at sign-up and the dates of signing up and confirming.
CREATE TABLE IF NOT EXISTS subscribers (
  id              INTEGER PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE COLLATE NOCASE,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  confirm_token   TEXT NOT NULL UNIQUE,
  unsub_token     TEXT NOT NULL UNIQUE,
  consent_text    TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  confirm_sent_at TEXT,
  confirmed_at    TEXT,
  unsubscribed_at TEXT
);

-- Sign-up attempts per hour, keyed by a salted hash of the sender's IP (the address itself is never stored).
CREATE TABLE IF NOT EXISTS attempts (
  bucket TEXT NOT NULL,
  who    TEXT NOT NULL,
  n      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, who)
);

-- An announcement ("it's ready"), and who it has gone to.
CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY, subject TEXT NOT NULL, text TEXT NOT NULL, html TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS deliveries (
  campaign_id   INTEGER NOT NULL REFERENCES campaigns (id),
  subscriber_id INTEGER NOT NULL REFERENCES subscribers (id),
  sent_at       TEXT,
  error         TEXT,
  PRIMARY KEY (campaign_id, subscriber_id)
);
CREATE INDEX IF NOT EXISTS deliveries_queue ON deliveries (sent_at, error);

-- Only with MAIL_MODE = "log" (testing): what would have been sent.
CREATE TABLE IF NOT EXISTS mail_log (
  id INTEGER PRIMARY KEY, to_addr TEXT, subject TEXT, text TEXT, html TEXT, unsubscribe TEXT, created_at TEXT
);
