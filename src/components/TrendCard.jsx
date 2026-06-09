import { useState, useEffect } from "react";

function TrendCard({ keyword, score, rising, date, onClick, isSelected }) {
  const [barWidth, setBarWidth] = useState(0);
  const hasData = date != null;

  useEffect(() => {
    if (!hasData) return;
    const t = setTimeout(() => setBarWidth(score), 80);
    return () => clearTimeout(t);
  }, [score, hasData]);

  return (
    <div
      className={`trend-card${isSelected ? " selected" : ""}`}
      onClick={onClick}
    >
      <div className="trend-card-top">
        <span className="trend-keyword">{keyword}</span>
        {hasData ? (
          <span className={`badge ${rising ? "badge-rising" : "badge-flat"}`}>
            {rising ? "↑ Rising" : "Stable"}
          </span>
        ) : (
          <span className="badge badge-pending">Pending</span>
        )}
      </div>
      {hasData ? (
        <div>
          <div className="trend-score-label">
            <span>Interest</span>
            <span className="trend-score-value">
              {score}
              <span className="score-suffix">/100</span>
            </span>
          </div>
          <div className="score-bar-track">
            <div
              className={`score-bar-fill${rising ? " rising" : ""}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="trend-pending-label">Awaiting first fetch</p>
      )}
    </div>
  );
}

export default TrendCard;
