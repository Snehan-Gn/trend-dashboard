const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "trends.db"));

// WAL mode lets reads/writes from this process and fetch_trends.py overlap
// without "database is locked" errors; busy_timeout retries briefly if a
// write still collides instead of failing immediately.
db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 5000");

db.exec(`
  CREATE TABLE IF NOT EXISTS keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    rising INTEGER NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (keyword_id) REFERENCES keywords(id),
    UNIQUE(keyword_id, date)
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_trends_keyword_date ON trends(keyword_id, date);

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (keyword_id) REFERENCES keywords(id)
  );
`);

const count = db.prepare("SELECT COUNT(*) as count FROM keywords").get();
if (count.count === 0) {
  const insert = db.prepare("INSERT INTO keywords (keyword) VALUES (?)");
  const insertTrend = db.prepare(
    "INSERT INTO trends (keyword_id, score, rising, date) VALUES (?, ?, ?, ?)",
  );

  const keywords = [
    "Streetwear",
    "Cargo pants",
    "Skinny jeans",
    "Oversized hoodie",
  ];
  keywords.forEach((kw, i) => {
    const result = insert.run(kw);
    insertTrend.run(
      result.lastInsertRowid,
      Math.floor(Math.random() * 100),
      i % 2,
      new Date().toISOString().slice(0, 10),
    );
  });

  console.log("Database seeded.");
}

// Backfill 12 weeks of simulated weekly history for keywords that only have
// a single data point (i.e. they've never had a real fetch yet).
// Uses INSERT OR IGNORE so it's safe to run on every startup — it will only
// fill dates that don't already exist.
function simulateHistory(endScore, weeks) {
  const scores = [];
  // Start from a random offset and drift toward endScore
  let s = Math.max(3, Math.min(97, endScore + (Math.random() - 0.5) * 40));
  for (let i = 0; i < weeks; i++) {
    scores.push(Math.round(s));
    const pull = (endScore - s) * 0.35;
    const noise = (Math.random() - 0.5) * 10;
    s = Math.max(3, Math.min(97, s + pull + noise));
  }
  return scores; // chronological, oldest → most recent (not including today)
}

const stubs = db
  .prepare(
    `SELECT k.id, MAX(t.score) AS score
     FROM keywords k
     JOIN trends t ON t.keyword_id = k.id
     GROUP BY k.id
     HAVING COUNT(t.id) = 1`,
  )
  .all();

if (stubs.length > 0) {
  const insertHist = db.prepare(
    "INSERT OR IGNORE INTO trends (keyword_id, score, rising, date) VALUES (?, ?, ?, ?)",
  );

  stubs.forEach(({ id, score }) => {
    const WEEKS = 12;
    const weeklyScores = simulateHistory(score, WEEKS);

    weeklyScores.forEach((weekScore, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (WEEKS - i) * 7);
      const dateStr = d.toISOString().slice(0, 10);
      const prevScore = i > 0 ? weeklyScores[i - 1] : weekScore;
      insertHist.run(id, weekScore, weekScore > prevScore ? 1 : 0, dateStr);
    });
  });

  console.log(`Backfilled history for ${stubs.length} keyword(s).`);
}

module.exports = db;
