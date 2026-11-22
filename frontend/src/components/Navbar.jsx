import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

function navClass(state) {
  return state.isActive ? "nav-active" : "";
}

function Navbar(props) {
  const [dark, setDark] = useState(function () {
    const saved = localStorage.getItem("theme");
    if (saved) {
      return saved === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [open, setOpen] = useState(false);

  useEffect(function () {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  function closeMenu() {
    setOpen(false);
  }

  function handleLogout() {
    setOpen(false);
    props.onLogout();
  }

  let firstLetter = "?";
  if (props.user && props.user.name) {
    firstLetter = props.user.name.charAt(0).toUpperCase();
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">ProjectForge</Link>
      <div className="nav-links">
        {props.token ? (
          <>
            <NavLink to="/discover" className={navClass}>Discover</NavLink>
            <NavLink to="/projects" className={navClass}>My Projects</NavLink>
            <NavLink to="/requests" className={navClass}>Requests</NavLink>
            <Link to="/projects/new" className="nav-cta">+ Post project</Link>

            <div className="account">
              <button
                type="button"
                className="account-btn"
                aria-label="Account menu"
                aria-expanded={open}
                onClick={function () { setOpen(!open); }}
              >
                {firstLetter}
              </button>

              {open && (
                <div className="account-menu">
                  {props.user && <div className="account-name">Signed in as {props.user.name}</div>}
                  <Link to="/profile" onClick={closeMenu}>My Profile</Link>
                  <button
                    type="button"
                    onClick={function () {
                      setDark(!dark);
                      setOpen(false);
                    }}
                  >
                    {dark ? "Light mode" : "Dark mode"}
                  </button>
                  <button type="button" className="menu-danger" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
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