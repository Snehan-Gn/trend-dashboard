import { useState } from "react";
import TrendCard from "./components/TrendCard";

const trends = [
  { id: 1, keyword: "JavaScript", score: 10, rising: true },
  { id: 2, keyword: "Python", score: 8, rising: false },
];

function App() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ padding: "32px" }}>
      <h1>Trend Dashboard</h1>
      <div style={{ display: "flex", gap: "16px" }}>
        {trends.map((trend, index) => (
          <TrendCard
            key={trend.id}
            keyword={trend.keyword}
            score={trend.score}
            rising={trend.rising}
            selected={selected === trend.id}
            onClick={() => setSelected(trend.id)}
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
          <p>Interest score: {selected.score}</p>
          <p>{selected.note}</p>
          <button onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;
