import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import TrendCard from "./components/TrendCard";
import NoteForm from "./components/NoteForm";
import Rising from "./pages/Rising";

function Dashboard() {
  const [trends, setTrends] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/trends")
      .then((res) => res.json())
      .then((data) => {
        setTrends(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load trends.");
        setLoading(false);
      });
  }, []);

  function loadTrend(id) {
    fetch(`http://localhost:3000/api/trends/${id}`)
      .then((res) => res.json())
      .then((data) => setSelected(data));
  }

  if (loading) return <p style={{ padding: "32px" }}>Loading trends...</p>;
  if (error) return <p style={{ padding: "32px", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "32px" }}>
      <h1>Dashboard</h1>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {trends.map((trend) => (
          <TrendCard
            key={trend.id}
            keyword={trend.keyword}
            score={trend.score}
            rising={trend.rising}
            isSelected={selected?.id === trend.id}
            onClick={() => loadTrend(trend.id)}
          />
        ))}
      </div>

      {selected && (
        <div
          style={{
            marginTop: "32px",
            padding: "24px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            maxWidth: "500px",
          }}
        >
          <h2>{selected.keyword}</h2>
          <p>Interest score: {selected.score}/100</p>
          <p>Status: {selected.rising ? "Trending up ↑" : "Trending down ↓"}</p>

          <h4 style={{ marginBottom: "8px" }}>Notes</h4>
          {selected.notes?.length === 0 && (
            <p style={{ color: "#999" }}>No notes yet.</p>
          )}
          {selected.notes?.map((note) => (
            <div
              key={note.id}
              style={{
                padding: "10px",
                background: "#f9f9f9",
                borderRadius: "6px",
                marginBottom: "8px",
                fontSize: "14px",
              }}
            >
              <p style={{ margin: 0 }}>{note.content}</p>
              <p style={{ margin: "4px 0 0", color: "#999", fontSize: "12px" }}>
                {note.created_at}
              </p>
            </div>
          ))}

          <NoteForm
            keywordId={selected.id}
            onNoteSaved={() => loadTrend(selected.id)}
          />

          <button
            onClick={() => setSelected(null)}
            style={{ marginTop: "16px", cursor: "pointer" }}
          >
            Close
          </button>
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
