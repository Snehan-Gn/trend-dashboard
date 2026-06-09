import { useState, useEffect } from "react";
import SparkLine from "./SparkLine";

function RisingCard({ id, keyword, score }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/api/trends/${id}/history`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="rising-card">
      <div className="rising-card-top">
        <div>
          <div className="rising-keyword">{keyword}</div>
          <div className="rising-score">
            Score: <strong>{score}</strong>/100
          </div>
        </div>
        <span className="rising-badge">↑ Rising</span>
      </div>
      {loading ? (
        <p className="chart-placeholder">Loading chart…</p>
      ) : history.length < 2 ? (
        <p className="chart-placeholder">Not enough data yet</p>
      ) : (
        <SparkLine data={history} />
      )}
    </div>
  );
}

export default RisingCard;
