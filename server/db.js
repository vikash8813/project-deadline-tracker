// Opens the SQLite database, creates the table and seeds it on first run.
import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import { seedProjects } from './seed.js';

// The whole database is one file that sits next to this script.
const dbFile = fileURLToPath(new URL('./data.sqlite', import.meta.url));
const db = new Database(dbFile);

// The CHECK rules are a second safety net: even if a bug skipped our
// validation code, the database itself would refuse bad data.
// deadline is stored as plain text "YYYY-MM-DD" (or NULL), with no time and
// no timezone, so it can never shift by a day.
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    status      TEXT    NOT NULL CHECK (status IN ('active', 'completed', 'on_hold')),
    deadline    TEXT,
    budget      REAL    NOT NULL CHECK (budget >= 0),
    spentAmount REAL    NOT NULL CHECK (spentAmount >= 0),
    createdAt   TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

// Seed only when the table is empty, so restarting the server never
// duplicates the seed data or wipes projects the user has added.
const { count } = db.prepare('SELECT COUNT(*) AS count FROM projects').get();

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO projects (title, status, deadline, budget, spentAmount)
    VALUES (@title, @status, @deadline, @budget, @spentAmount)
  `);
  for (const project of seedProjects) {
    insert.run(project);
  }
  console.log(`Seeded ${seedProjects.length} projects.`);
}

export default db;
