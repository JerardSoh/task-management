import React, { useEffect, useState } from "react";
import { logout } from "../apiService";
import { Link, useNavigate } from "react-router-dom";
import { checkAdmin, checkAuth } from "../apiService";
import "../styles/NavigationBar.css"; // Updated import path

const NavigationBar = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(null);

    useEffect(() => {
        const verifyAuthAndAdmin = async () => {
            try {
                await checkAuth();
            } catch (error) {
                navigate("/login");
                return;
            }
            try {
                await checkAdmin();
                setIsAdmin(true);
            } catch (error) {
                setIsAdmin(false);
            }
        };
        verifyAuthAndAdmin();
    }, [navigate]);

    const handleNavigation = async (event, path) => {
        event.preventDefault();
        try {
            await checkAuth();
        } catch (error) {
            navigate("/login");
            return;
        }
        let adminStatus = false;
        try {
            const data = await checkAdmin();
            adminStatus = data.success;
            setIsAdmin(true);
        } catch (error) {
            setIsAdmin(false);
        }
        if (path === "/user-management" && !adminStatus) {
            navigate("/");
        } else {
            navigate(path);
        }
    };

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
        <div className="navbar">
            <div className="nav-links">
                <Link
                    to="/"
                    onClick={(e) => handleNavigation(e, "/")}
                    className="nav-link"
                >
                    Home
                </Link>
                <Link
                    to="/profile"
                    onClick={(e) => handleNavigation(e, "/profile")}
                    className="nav-link"
                >
                    Profile
                </Link>
                {isAdmin && (
                    <Link
                        to="/user-management"
                        onClick={(e) => handleNavigation(e, "/user-management")}
                        className="nav-link"
                    >
                        User Management
                    </Link>
                )}
            </div>
            <div>
                <Link to="/logout" onClick={handleLogout} className="nav-link">
                    Logout
                </Link>
            </div>
        </div>
    );
};

export default NavigationBar;
