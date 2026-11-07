import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../features/authSlice";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    try {
      await dispatch(loginUser(form)).unwrap(); // throws if login failed
      navigate("/");
    } catch (err) {
      setLocalError(typeof err === "string" ? err : "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      {localError && <p style={{ color: "red" }}>{localError}</p>}
      <Link to="/register">Create account</Link>
    </form>
  );
}