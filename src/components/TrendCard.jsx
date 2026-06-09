import { useState, useEffect } from "react";

function TrendCard({ keyword, score, rising, onClick, isSelected }) {
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(score), 80);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div
      className={`trend-card${isSelected ? " selected" : ""}`}
      onClick={onClick}
    >
      <div className="trend-card-top">
        <span className="trend-keyword">{keyword}</span>
        <span className={`badge ${rising ? "badge-rising" : "badge-flat"}`}>
          {rising ? "↑ Rising" : "Stable"}
        </span>
      </div>
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
    </div>
  );
}

export default TrendCard;
