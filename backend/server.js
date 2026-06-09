const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const db = require("./db");
const runFetchTrends = require("./fetchTrends");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/api/trends", (req, res) => {
  const trends = db
    .prepare(
      `
    SELECT
      k.id,
      k.keyword,
      COALESCE(t.score, 0)   AS score,
      COALESCE(t.rising, 0)  AS rising,
      t.date
    FROM keywords k
    LEFT JOIN trends t
      ON t.keyword_id = k.id
      AND t.date = (SELECT MAX(date) FROM trends WHERE keyword_id = k.id)
    ORDER BY t.score DESC NULLS LAST
  `,
    )
    .all();

  res.json(trends);
});

app.post("/api/keywords", (req, res) => {
  const keyword = req.body.keyword?.trim();
  if (!keyword) {
    return res.status(400).json({ error: "keyword is required" });
  }
  try {
    const result = db
      .prepare("INSERT INTO keywords (keyword) VALUES (?)")
      .run(keyword);
    res.status(201).json({ id: result.lastInsertRowid, keyword });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint")) {
      return res.status(409).json({ error: "Already tracking this keyword" });
    }
    res.status(500).json({ error: "Failed to add keyword" });
  }
});

app.get("/api/trends/:id", (req, res) => {
  const keyword = db
    .prepare("SELECT * FROM keywords WHERE id = ?")
    .get(req.params.id);

  if (!keyword) {
    return res.status(404).json({ error: "Not found" });
  }

  const latestTrend = db
    .prepare(
      `
    SELECT * FROM trends
    WHERE keyword_id = ?
    ORDER BY date DESC
    LIMIT 1
  `,
    )
    .get(req.params.id);

  const notes = db
    .prepare(
      "SELECT * FROM notes WHERE keyword_id = ? ORDER BY created_at DESC",
    )
    .all(req.params.id);

  res.json({ ...keyword, ...latestTrend, notes });
});

app.post("/api/notes", (req, res) => {
  const { keyword_id, content } = req.body;

  if (!keyword_id || !content) {
    return res
      .status(400)
      .json({ error: "keyword_id and content are required" });
  }

  const result = db
    .prepare("INSERT INTO notes (keyword_id, content) VALUES (?, ?)")
    .run(keyword_id, content);

  res.status(201).json({ id: result.lastInsertRowid, keyword_id, content });
});

app.post("/api/refresh", async (req, res) => {
  try {
    await runFetchTrends();
    res.json({ message: "Trends updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update trends" });
  }
});

app.get("/api/trends/:id/history", (req, res) => {
  const history = db
    .prepare(
      `
    SELECT score, rising, date
    FROM trends
    WHERE keyword_id = ?
    ORDER BY date ASC
  `,
    )
    .all(req.params.id);

  res.json(history);
});

function fetchIfStale() {
  const today = new Date().toISOString().slice(0, 10);
  const row = db.prepare("SELECT 1 FROM trends WHERE date = ? LIMIT 1").get(today);
  if (row) {
    console.log("Trends already up to date for today, skipping fetch.");
    return;
  }
  runFetchTrends().catch(console.error);
}

fetchIfStale();

cron.schedule("0 0 * * *", () => {
  runFetchTrends().catch(console.error);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
