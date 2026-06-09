const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// GET /api/trends — return all keywords with their latest score
app.get("/api/trends", (req, res) => {
  const trends = db
    .prepare(
      `
    SELECT
      k.id,
      k.keyword,
      t.score,
      t.rising,
      t.date
    FROM keywords k
    JOIN trends t ON t.keyword_id = k.id
    WHERE t.id = (
      SELECT id FROM trends WHERE keyword_id = k.id ORDER BY date DESC, id DESC LIMIT 1
    )
    ORDER BY t.score DESC
  `,
    )
    .all();

  res.json(trends);
});

// GET /api/trends/:id — return one keyword with its notes
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

// POST /api/notes — add a note to a keyword
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
