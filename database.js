// Uses Node.js built-in sqlite (v22.5+) — no native compilation needed!
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'lumina.db'));

// Enable WAL mode and foreign keys
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid        TEXT    UNIQUE NOT NULL,
    name        TEXT    NOT NULL,
    email       TEXT    UNIQUE NOT NULL,
    password    TEXT    NOT NULL,
    role        TEXT    NOT NULL DEFAULT 'student',
    major       TEXT,
    year        TEXT,
    bio         TEXT,
    avatar_url  TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS artworks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid         TEXT    UNIQUE NOT NULL,
    title        TEXT    NOT NULL,
    description  TEXT,
    category     TEXT    NOT NULL,
    tags         TEXT,
    image_url    TEXT,
    file_url     TEXT,
    status       TEXT    NOT NULL DEFAULT 'pending',
    featured     INTEGER NOT NULL DEFAULT 0,
    views        INTEGER NOT NULL DEFAULT 0,
    user_id      INTEGER NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS likes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    artwork_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, artwork_id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS comments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    content    TEXT    NOT NULL,
    user_id    INTEGER NOT NULL,
    artwork_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT,
    event_type  TEXT    NOT NULL DEFAULT 'exhibition',
    location    TEXT,
    event_date  TEXT    NOT NULL,
    event_time  TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ── Seed default admin ─────────────────────────────────────────
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare(`INSERT INTO users (uuid, name, email, password, role, major, year, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    uuidv4(), 'Admin', 'admin@lumina.edu', hash, 'admin',
    'Administration', '', 'Exhibition administrator'
  );
  console.log('✅ Default admin created: admin@lumina.edu / admin123');
}

// ── Seed sample events ─────────────────────────────────────────
const eventsCount = db.prepare('SELECT COUNT(*) as c FROM events').get();
if (eventsCount.c === 0) {
  const insert = db.prepare(`INSERT INTO events (title, description, event_type, location, event_date, event_time) VALUES (?,?,?,?,?,?)`);
  [
    ['Exhibition Opening Night', 'The grand opening of the 2025 Lumina Exhibition. All are welcome!', 'opening', 'Gallery B, Block 4', '2025-03-14', '18:00'],
    ['Artist Talk: Digital Futures', 'Panel discussion with alumni and industry guests on the future of digital art.', 'talk', 'Auditorium A', '2025-03-18', '14:00'],
    ['Awards Ceremony & Jury Panel', 'Best in Show, Category Winners and Jury Special Prize announced live.', 'award', 'Main Hall', '2025-03-21', '17:00'],
    ['Live Generative Art Workshop', 'Hands-on workshop using TouchDesigner and p5.js for generative visuals.', 'workshop', 'Media Lab 2', '2025-03-25', '10:00'],
    ['Closing Exhibition & Reception', 'The final evening of Lumina 2025 with live music and reception dinner.', 'closing', 'Gallery B, Block 4', '2025-03-28', '19:00'],
  ].forEach(e => insert.run(...e));
  console.log('✅ Sample events seeded');
}

module.exports = db;
