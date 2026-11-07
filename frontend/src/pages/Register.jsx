import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { request } from "../api";

function Register(props) {
  const [name, setName] = useState("");
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
      const data = await request("/api/auth/register", "POST", {
        name: name,
        email: email,
        password: password
      });
      props.onLogin(data);
      navigate("/profile"); // naya user pehle profile bharega
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card auth-card form" onSubmit={handleSubmit}>
      <h2>Create account</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={function (e) { setName(e.target.value); }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={function (e) { setEmail(e.target.value); }}
      />
      <input
        type="password"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={function (e) { setPassword(e.target.value); }}
      />
      <button disabled={loading}>{loading ? "Creating..." : "Register"}</button>
      {error && <p className="error">{error}</p>}
      <Link to="/login">Already have an account? Login</Link>
    </form>
  );
}

export default Register;