import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./features/authSlice";

function Navbar() {
  const token = useSelector((s) => s.auth.token);
  const dispatch = useDispatch();

  return (
    <nav>
      <Link to="/">Home</Link>
      {token ? (
        <>
          <Link to="/profile">Profile</Link>
          <button onClick={() => dispatch(logout())}>Logout</button>
          <Link to="/discover">Discover</Link>
        </>
      ) : (
        <>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
          
        </>
      )}
    </nav>
  );
}

export default Navbar;