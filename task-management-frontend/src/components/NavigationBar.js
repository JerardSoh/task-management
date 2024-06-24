import React, { useEffect, useState } from "react";
import { logout, checkAdmin } from "../apiService";
import { Link, useNavigate } from "react-router-dom";

const NavigationBar = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                const response = await checkAdmin();
                setIsAdmin(true);
            } catch (error) {
                setIsAdmin(false);
            }
        };
        verifyAdmin();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                backgroundColor: "#f0f0f0",
            }}
        >
            <div>
                <Link to="/" style={{ marginRight: "10px" }}>
                    Home
                </Link>
                <Link to="/profile" style={{ marginRight: "10px" }}>
                    Profile
                </Link>
                {isAdmin && (
                    <Link to="/user-management" style={{ marginRight: "10px" }}>
                        User Management
                    </Link>
                )}
            </div>
            <div>
                <Link to="/logout" onClick={handleLogout}>
                    Logout
                </Link>
            </div>
        </div>
    );
};

export default NavigationBar;
