import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkAdmin } from "../apiService";

const AdminProtectedRoute = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(null);

    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                await checkAdmin();
                setIsAdmin(true);
            } catch (error) {
                setIsAdmin(false);
            }
        };
        verifyAdmin();
    }, []);

    if (isAdmin === null) {
        return <div>Loading...</div>; // Optional loading state
    }

    if (!isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
};

export default AdminProtectedRoute;
