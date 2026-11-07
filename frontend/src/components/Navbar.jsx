import { Link } from "react-router-dom";

function Navbar(props) {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">ProjectForge</Link>
      <div className="nav-links">
        {props.token ? (
          <>
            <Link to="/projects">My Projects</Link>
            <Link to="/profile">My Profile</Link>
            <button className="btn-outline" onClick={props.onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;