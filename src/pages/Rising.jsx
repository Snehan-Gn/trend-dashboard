import { useState, useEffect } from "react";
import RisingCard from "../components/RisingCard";

function Rising() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/trends")
      .then((res) => res.json())
      .then((data) => {
        // Filter only rising keywords
        const rising = data.filter((t) => t.rising === 1);
        setTrends(rising);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: "32px" }}>Loading...</p>;

  return (
    <div style={{ padding: "32px" }}>
      <h1>Rising Trends</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Keywords gaining momentum in the last 4 weeks
      </p>

      {trends.length === 0 ? (
        <p style={{ color: "#999" }}>No rising trends right now.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {trends.map((trend) => (
            <RisingCard
              key={trend.id}
              id={trend.id}
              keyword={trend.keyword}
              score={trend.score}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Rising;
