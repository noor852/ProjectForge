import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { request } from "../api";

function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await request("/api/auth/login", "POST", { email: email, password: password });
      props.onLogin(data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card auth-card form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={function (e) { setEmail(e.target.value); }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={function (e) { setPassword(e.target.value); }}
      />
      <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      {error && <p className="error">{error}</p>}
      <Link to="/register">Create account</Link>
    </form>
  );
}

export default Login;