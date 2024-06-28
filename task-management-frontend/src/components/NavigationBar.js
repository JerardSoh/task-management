import React, { useEffect, useState } from "react";
import { logout } from "../apiService";
import { Link, useNavigate } from "react-router-dom";
import { checkAdmin, checkAuth } from "../apiService";

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
        // Redirect to home if user is not an admin and tries to access user-management
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
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                backgroundColor: "#f0f0f0",
            }}
        >
            <div>
                <Link
                    to="/"
                    onClick={(e) => handleNavigation(e, "/")}
                    style={{ marginRight: "10px" }}
                >
                    Home
                </Link>
                <Link
                    to="/profile"
                    onClick={(e) => handleNavigation(e, "/profile")}
                    style={{ marginRight: "10px" }}
                >
                    Profile
                </Link>
                {isAdmin && (
                    <Link
                        to="/user-management"
                        onClick={(e) => handleNavigation(e, "/user-management")}
                        style={{ marginRight: "10px" }}
                    >
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
