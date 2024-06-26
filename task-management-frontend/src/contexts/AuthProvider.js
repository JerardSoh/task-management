import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext"; // Import the context created
import axios from "axios"; // Import axios for API calls

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if the user is already logged in when the app starts
        const checkAuth = async () => {
            try {
                const response = await axios.get("/auth");
                if (response.data.success) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error("User is not authenticated", error);
            }
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post("/login", { username, password });
            if (response.data.success) {
                // Fetch user info after login
                const userResponse = await axios.get("/auth");
                setUser(userResponse.data.user);
            }
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axios.post("/logout");
            setUser(null);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
