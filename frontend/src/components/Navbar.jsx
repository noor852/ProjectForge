import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar(props) {
  const [dark, setDark] = useState(function () {
    const saved = localStorage.getItem("theme");
    if (saved) {
      return saved === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(function () {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <nav className="navbar">
      <Link to="/" className="brand">ProjectForge</Link>
      <div className="nav-links">
        {props.token ? (
          <>
            <Link to="/projects">My Projects</Link>
            <Link to="/discover">Discover</Link>
            <Link to="/invitations">Invitations</Link>
            <Link to="/profile">My Profile</Link>
            {props.user && <span className="nav-user">Hi, {props.user.name}</span>}
            <button className="btn-outline" onClick={props.onLogout}>Logout</button>
            <button type="button" className="btn-outline" onClick={function () { setDark(!dark); }}>
              {dark ? "Light" : "Dark"}
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <button type="button" className="btn-outline" onClick={function () { setDark(!dark); }}>
              {dark ? "Light" : "Dark"}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;