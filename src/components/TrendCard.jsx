import { useState, useEffect } from "react";

function TrendCard({ index, keyword, score, rising, date, favorite, onClick, onDelete, onToggleFavorite, isSelected }) {
  const [barWidth, setBarWidth] = useState(0);
  const hasData = date != null;

  useEffect(() => {
    if (!hasData) return;
    const t = setTimeout(() => setBarWidth(score), 80);
    return () => clearTimeout(t);
  }, [score, hasData]);

  return (
    <div
      className={`trend-card${isSelected ? " selected" : ""}${favorite ? " favorite" : ""}`}
      onClick={onClick}
    >
      <div className="trend-card-top">
        <div>
          <div className="trend-card-index">{String(index + 1).padStart(2, "0")}</div>
          <span className="trend-keyword">{keyword}</span>
        </div>
        <div className="trend-card-actions">
          {hasData ? (
            <span className={`badge ${rising ? "badge-rising" : "badge-flat"}`}>
              {rising ? "↑ Rising" : "Stable"}
            </span>
          ) : (
            <span className="badge badge-pending">Pending</span>
          )}
          <button
            className={`trend-favorite-btn${favorite ? " active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            aria-label={favorite ? `Unpin ${keyword}` : `Pin ${keyword}`}
            title={favorite ? "Unpin" : "Pin to top"}
          >
            {favorite ? "★" : "☆"}
          </button>
          <button
            className="trend-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={`Remove ${keyword}`}
            title="Remove keyword"
          >
            ×
          </button>
        </div>
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
