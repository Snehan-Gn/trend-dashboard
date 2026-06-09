import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import TrendCard from "./components/TrendCard";
import NoteForm from "./components/NoteForm";
import KeywordForm from "./components/KeywordForm";
import Rising from "./pages/Rising";

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

  function loadTrends() {
    return fetch("http://localhost:3000/api/trends")
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
    fetch(`http://localhost:3000/api/trends/${id}`)
      .then((res) => res.json())
      .then((data) => setSelected(data));
  }

  function handleRefresh() {
    setRefreshing(true);
    fetch("http://localhost:3000/api/refresh", { method: "POST" })
      .then(() => loadTrends())
      .finally(() => setRefreshing(false));
  }

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
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{trends.length} keywords tracked</p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? "↻ Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      <div className="stats-row">
        <StatChip label="Keywords" value={trends.length} />
        <StatChip label="Rising" value={risingCount} color="var(--green)" />
        <StatChip label="Avg score" value={avgScore} />
        <StatChip label="Updated" value={latestDate} />
      </div>

      <KeywordForm onAdded={loadTrends} />

      <div className="cards-grid">
        {trends.map((trend) => (
          <TrendCard
            key={trend.id}
            keyword={trend.keyword}
            score={trend.score}
            rising={trend.rising}
            date={trend.date}
            isSelected={selected?.id === trend.id}
            onClick={() => loadTrend(trend.id)}
          />
        ))}
      </div>

      {selected && (
        <div className="detail-panel">
          <div className="detail-header">
            <div>
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
