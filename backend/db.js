const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "trends.db"));

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

module.exports = db;
