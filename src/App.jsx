import { useState, useEffect } from "react";
import TrendCard from "./components/TrendCard";

function fakeFetch() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, keyword: "JavaScript", score: 10, rising: true },
        { id: 2, keyword: "Python", score: 8, rising: false },
      ]);
    }, 1000);
  });
}

function App() {
  const [trends, setTrends] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fakeFetch()
      .then((data) => {
        setTrends(data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
      });
  }, []);

  if (loading) {
    return <p style={{ padding: "32px" }}>Loading...</p>;
  }

  if (error) {
    return <p style={{ padding: "32px" }}>Error: {error.message}</p>;
  }

  return (
    <div style={{ padding: "32px" }}>
      <h1>Trend Dashboard</h1>
      <div style={{ display: "flex", gap: "16px" }}>
        {trends.map((trend) => (
          <TrendCard
            key={trend.id}
            keyword={trend.keyword}
            score={trend.score}
            rising={trend.rising}
            onClick={() => setSelected(trend)}
            isSelected={selected?.id === trend.id}
          />
        ))}
      </div>

      {selected && (
        <div
          style={{
            marginTop: "24px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h2>{selected.keyword}</h2>
          <p>Interest score: {selected.score}/100</p>
          <p>{selected.note}</p>
          <button onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;
