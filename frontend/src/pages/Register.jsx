import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../features/authSlice";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [localError, setLocalError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    try {
      await dispatch(registerUser(form)).unwrap(); // throws if registration failed
      navigate("/profile");                        // new users fill in their profile first
    } catch (err) {
      setLocalError(typeof err === "string" ? err : "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create account</h2>
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password (min 6 characters)"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button disabled={loading}>{loading ? "Creating..." : "Register"}</button>
      {localError && <p style={{ color: "red" }}>{localError}</p>}
      <Link to="/login">Already have an account? Login</Link>
    </form>
  );
}