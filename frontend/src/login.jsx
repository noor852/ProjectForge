import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import store from "./store";

function Login(){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const users = useSelector((state) => state.users.users);
}