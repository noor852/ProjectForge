import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/authSlice";
import { Link } from "react-router-dom";

function Login(){

    const [form, setForm] = useState({email: "", password: ""});
    const {token, loading, error} = useSelector((s) => s.auth) ;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const users = useSelector((s) => s.auth.users);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser(form));
    }
    return (<form onSubmit={handleSubmit}>
            <label>Email</label>
            <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({...form, email:e.target.value})}></input>
            <label>Password</label>
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password:e.target.value})}></input>
            <button disabled={loading}>{loading ? "Logging in...." : "Log In"}</button>
            {error && <p style={{color: "red"}}>{error}</p>}
            <Link to="/register">Create Account</Link>
        </form>);
}

export default Login;