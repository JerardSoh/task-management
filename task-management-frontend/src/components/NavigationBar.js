import React, { useEffect, useState } from "react";
import { logout } from "../apiService";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { checkAdmin } from "../apiService";

const NavigationBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await logout();
            setIsAdmin(false);
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
