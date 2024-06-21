import React, { useState } from "react";
import axios from "axios";
import { login } from "../apiService";
import { useNavigate } from "react-router-dom";

const LoginComponent = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const data = await login(username, password);
            setMessage(data.message);
            navigate("/home");
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                    display: "block",
                    margin: "10px auto",
                    padding: "10px",
                }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                    display: "block",
                    margin: "10px auto",
                    padding: "10px",
                }}
            />
            <button onClick={handleLogin} style={{ padding: "10px 20px" }}>
                Login
            </button>
            <p>{message}</p>
        </div>
    );
};

export default LoginComponent;
