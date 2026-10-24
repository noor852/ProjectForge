import { useState } from "react";
import { registerUser } from "./userSlice";
import { useSelector, useDispatch, useStore } from "react-redux";
import { replace, useNavigate } from "react-router-dom";

function Register(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const users = useSelector((state) => state.users);
    
    function userExists(email, password){
        const normalisedEmail = email.trim().toLowerCase();

        if (users.email === normalisedEmail){
            console.log("Email already registered in ProjectForge!");
            alert("Email already registered in ProjectForge!");

            return;
        }

        // save it to store.jsx
        dispatch(registerUser({id: crypto.randomUUID(), email:normalisedEmail, password: password}));
        alert("Registration Successful! Proceed to login!");
        navigate('\login',{ replace: true});
    }

    <form onClick={userExists}>
        <label>Email</label>
        <input type="text" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}></input>
        <label>Password</label>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
    </form>
}