import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "./userSlice";
import store from "./store";

function Login(){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const users = useSelector((state) => state.users.users);

    function userExists(email, password){
        const emailNormalised = email.trim().toLowerCase();

        // just check with users if the email matches then good to go
        if (users.email === emailNormalised && users.password === password){
            useDispatch(loginUser({emailNormalised, password}));
            alert("Login Successful!");

        }
        console.log("Incorrect password or email address!");
        alert("Login Failed: Incorrect password or email address!");

        <form onSubmit={userExists}>
            <label>Email</label>
            <input type="text" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}></input>
            <label>Password</label>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
        </form>
    }
}