import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">TD</div>
        <span className="navbar-title">TrendDash</span>
      </div>
      <div className="navbar-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/rising"
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          Rising
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
