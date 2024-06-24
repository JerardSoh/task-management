import React from "react";
import { Link } from "react-router-dom";
import { logout } from "../apiService";
import { useNavigate } from "react-router-dom";

const NavigationBar = () => {
    const navigate = useNavigate();

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
                <Link to="/user-management" style={{ marginRight: "10px" }}>
                    User Management
                </Link>
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
