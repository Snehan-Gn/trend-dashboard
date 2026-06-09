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
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "20px",
        width: "280px",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 4px" }}>{keyword}</h3>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Score: <strong>{score}</strong>/100
          </p>
        </div>
        <span
          style={{
            background: "#dcfce7",
            color: "#15803d",
            fontSize: "12px",
            padding: "4px 10px",
            borderRadius: "99px",
            fontWeight: 500,
          }}
        >
          ↑ Rising
        </span>
      </div>

      <div style={{ marginTop: "16px" }}>
        {loading ? (
          <p style={{ color: "#999", fontSize: "13px" }}>Loading chart...</p>
        ) : history.length < 2 ? (
          <p style={{ color: "#999", fontSize: "13px" }}>Not enough data yet</p>
        ) : (
          <SparkLine data={history} />
        )}
      </div>
    </div>
  );
}

export default RisingCard;
