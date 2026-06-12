import { useState, useEffect, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { API_URL } from "./config";
import Navbar from "./components/Navbar";
import TrendCard from "./components/TrendCard";
import NoteForm from "./components/NoteForm";
import KeywordForm from "./components/KeywordForm";
import HistoryChart from "./components/HistoryChart";
import Rising from "./pages/Rising";

const SORT_OPTIONS = [
  { value: "score-desc", label: "Score (High → Low)" },
  { value: "score-asc", label: "Score (Low → High)" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "rising", label: "Rising first" },
];

function sortTrends(trends, sortBy) {
  const sorted = [...trends];
  switch (sortBy) {
    case "score-asc":
      sorted.sort((a, b) => a.score - b.score);
      break;
    case "name-asc":
      sorted.sort((a, b) => a.keyword.localeCompare(b.keyword));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.keyword.localeCompare(a.keyword));
      break;
    case "rising":
      sorted.sort((a, b) => b.rising - a.rising || b.score - a.score);
      break;
    default:
      sorted.sort((a, b) => b.score - a.score);
  }
  // Pinned favorites always float to the top, in their sorted order.
  sorted.sort((a, b) => b.favorite - a.favorite);
  return sorted;
}

function StatChip({ label, value, color }) {
  return (
    <div className="stat-chip">
      <span className="stat-value" style={color ? { color } : undefined}>
        {value}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function Dashboard() {
  const [trends, setTrends] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState("score-desc");

  function loadTrends() {
    return fetch(`${API_URL}/api/trends`)
      .then((res) => res.json())
      .then((data) => {
        setTrends(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load trends. Is the backend running?");
        setLoading(false);
      });
  }

  useEffect(() => { loadTrends(); }, []);

  function loadTrend(id) {
    fetch(`${API_URL}/api/trends/${id}`)
      .then((res) => res.json())
      .then((data) => setSelected(data));
  }

  function handleRefresh() {
    setRefreshing(true);
    fetch(`${API_URL}/api/refresh`, { method: "POST" })
      .then(() => loadTrends())
      .finally(() => setRefreshing(false));
  }

  function handleDelete(id) {
    if (!window.confirm("Remove this keyword and its history?")) return;

    fetch(`${API_URL}/api/keywords/${id}`, { method: "DELETE" })
      .then(() => {
        if (selected?.id === id) setSelected(null);
        loadTrends();
      });
  }

  function handleToggleFavorite(id) {
    fetch(`${API_URL}/api/keywords/${id}/favorite`, { method: "PATCH" })
      .then(() => loadTrends());
  }

  const sortedTrends = useMemo(() => sortTrends(trends, sortBy), [trends, sortBy]);

  const risingCount = trends.filter((t) => t.rising).length;
  const avgScore = trends.length
    ? Math.round(trends.reduce((s, t) => s + t.score, 0) / trends.length)
    : 0;
  const latestDate = trends[0]?.date ?? "—";

  if (loading) {
    return (
      <div className="state-container">
        <p className="state-label">Loading trends</p>
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Field Report — Live Index</p>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{trends.length} keywords tracked</p>
        </div>
        <div className="page-header-actions">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort keywords"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
          <button
            className="btn btn-ghost"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? "↻ Refreshing…" : "↻ Refresh"}
          </button>
        </div>
      </div>

      <div className="stats-row">
        <StatChip label="Keywords" value={trends.length} />
        <StatChip label="Rising" value={risingCount} color="var(--accent)" />
        <StatChip label="Avg score" value={avgScore} />
        <StatChip label="Updated" value={latestDate} />
      </div>

      <KeywordForm onAdded={loadTrends} />

      <div className="cards-grid">
        {sortedTrends.map((trend, i) => (
          <TrendCard
            key={trend.id}
            index={i}
            keyword={trend.keyword}
            score={trend.score}
            rising={trend.rising}
            date={trend.date}
            favorite={!!trend.favorite}
            isSelected={selected?.id === trend.id}
            onClick={() => loadTrend(trend.id)}
            onDelete={() => handleDelete(trend.id)}
            onToggleFavorite={() => handleToggleFavorite(trend.id)}
          />
        ))}
      </div>

      {selected && (
        <div className="detail-panel">
          <div className="detail-header">
            <div>
              <p className="detail-kicker">Trend Report</p>
              <h2 className="detail-keyword">{selected.keyword}</h2>
              <div className="detail-meta">
                <span className="detail-score">
                  Interest score: <strong>{selected.score}/100</strong>
                </span>
                <span className={`badge ${selected.rising ? "badge-rising" : "badge-flat"}`}>
                  {selected.rising ? "↑ Rising" : "Stable"}
                </span>
              </div>
            </div>
            <button className="detail-close" onClick={() => setSelected(null)}>
              ×
            </button>
          </div>

          <HistoryChart id={selected.id} />

          <div className="notes-section">
            <p className="notes-title">Notes</p>
            {selected.notes?.length === 0 && (
              <p className="notes-empty">No notes yet.</p>
            )}
            {selected.notes?.map((note) => (
              <div key={note.id} className="note-item">
                <p className="note-content">{note.content}</p>
                <p className="note-date">{note.created_at}</p>
              </div>
            ))}
            <NoteForm
              keywordId={selected.id}
              onNoteSaved={() => loadTrend(selected.id)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rising" element={<Rising />} />
      </Routes>
    </>
  );
}

export default App;
