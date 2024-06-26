import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "./AdminContext";

const AdminProtectedRoute = ({ children }) => {
    const { isAdmin, verifyAdmin } = useAdmin();

    useEffect(() => {
        const auth = async () => {
            try {
                await verifyAdmin();
            } catch (error) {
                console.error("Error checking admin status:", error);
            }
        };
        auth();
    }, [verifyAdmin]);

    if (isAdmin === null) {
        return <div>Loading...</div>; // Optional loading state
    }

    if (!isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
};

export default AdminProtectedRoute;
