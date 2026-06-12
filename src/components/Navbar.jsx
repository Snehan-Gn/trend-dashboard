import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-mark">
          TREND<span className="navbar-slash">/</span>LINE
        </span>
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
      <span className="navbar-meta">Vol. 01 — Street Signals</span>
    </nav>
  );
}

export default Navbar;
