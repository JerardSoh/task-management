const bcrypt = require("bcryptjs");
const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const { createAndSetToken } = require("../utils/tokenManager");

// Constants for HTTP status codes
const STATUS_OK = 200;
const STATUS_UNAUTHORIZED = 401;

// Login route: /login
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        throw new HttpError(
            "Username and password are required",
            STATUS_UNAUTHORIZED
        );
    }
    // Check if user exists
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
        username,
    ]);
    const user = rows[0];

    // Check if user exists or password is correct
    if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new HttpError(
                "Login failed. Invalid username or password",
                STATUS_UNAUTHORIZED
            );
        }
    } else {
        throw new HttpError(
            "Login failed. Invalid username or password",
            STATUS_UNAUTHORIZED
        );
    }

    // Check if status is active
    if (!user.status) {
        throw new HttpError(
            "Login failed. Invalid username or password",
            STATUS_UNAUTHORIZED
        );
    }

    // Create and set token in cookie
    createAndSetToken(req, res, user);

    res.status(200).json({ success: true });
});

// checkAuth route: /auth
const checkAuth = asyncHandler(async (req, res) => {
    res.status(STATUS_OK).json({
        success: true,
        message: "User is authenticated",
    });
});

// isAdmin route: /admin
const isAdmin = asyncHandler(async (req, res) => {
    res.status(STATUS_OK).json({
        success: true,
        message: "User is an admin",
    });
});

// Logout route: /logout
const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token", "", { expires: new Date(0) });
    res.status(STATUS_OK).json({
        success: true,
        message: "Logged out successfully",
    });
});

module.exports = { login, logout, checkAuth, isAdmin };
