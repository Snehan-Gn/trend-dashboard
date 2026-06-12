import { useState, useEffect } from "react";
import { API_URL } from "../config";
import RisingCard from "../components/RisingCard";

function Rising() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/trends`)
      .then((res) => res.json())
      .then((data) => {
        setTrends(data.filter((t) => t.rising === 1));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="state-container">
        <p className="state-label">Loading</p>
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Field Report — On the Rise</p>
          <h1 className="page-title">Rising</h1>
          <p className="page-subtitle">
            Keywords gaining momentum over the last 4 weeks
          </p>
        </div>
      </div>

      {trends.length === 0 ? (
        <div className="state-container" style={{ padding: "60px 0" }}>
          <p className="empty-label">No rising trends right now.</p>
        </div>
      ) : (
        <div className="rising-grid">
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
