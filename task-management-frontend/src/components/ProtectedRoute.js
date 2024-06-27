import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkAuth } from "../apiService";

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const auth = async () => {
            try {
                await checkAuth();
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
                console.error("Error checking authentication:", error);
            }
        };
        auth();
    }, []);

    if (isAuthenticated === null) {
        return <div>Loading...</div>; // Optional loading state
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
