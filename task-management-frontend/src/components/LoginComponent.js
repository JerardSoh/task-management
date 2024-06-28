import React, { useState } from "react";
import { login } from "../apiService";
import { useNavigate } from "react-router-dom";
import "../styles/LoginComponent.css"; // Import the CSS file

const LoginComponent = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const data = await login(username, password);
            setMessage(data.message);
            navigate("/");
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="login-container">
            <h2>Task Management System</h2>
            <p className={`message ${message && "error-message"}`}>{message}</p>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
            />
            <button onClick={handleLogin} className="login-button">
                Login
            </button>
        </div>
    );
};

export default LoginComponent;
