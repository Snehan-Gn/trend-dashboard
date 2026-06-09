function TrendCard({ keyword, score, rising, onClick, isSelected }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: isSelected ? "2px solid black" : "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        width: "200px",
        cursor: "pointer",
      }}
    >
      <h3>{keyword}</h3>
      <p>Score: {score}</p>
      <p>{rising ? "Rising" : "Falling"}</p>
    </div>
  );
}

export default TrendCard;
