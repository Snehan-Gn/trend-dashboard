import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: "24px",
        padding: "12px 32px",
        borderBottom: "1px solid #e5e7eb",
        background: "#fff",
      }}
    >
      <span style={{ fontWeight: 700, fontSize: "18px" }}>TrendDash</span>
      <Link to="/" style={{ textDecoration: "none", color: "#374151" }}>
        Dashboard
      </Link>
      <Link to="/rising" style={{ textDecoration: "none", color: "#374151" }}>
        Rising
      </Link>
    </nav>
  );
}

export default Navbar;
