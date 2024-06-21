const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const { createAndSetToken } = require("../utils/tokenManager");

// Constants for HTTP status codes
const STATUS_OK = 200;
const STATUS_UNAUTHORIZED = 401;
const STATUS_FORBIDDEN = 403;

// Login route: /login
const login = asyncHandler(async (req, res, next) => {
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

    // Check if user exists
    if (!user) {
        throw new HttpError("User not found", STATUS_UNAUTHORIZED);
    }

    // Check if status is active
    if (!user.status) {
        throw new HttpError("User is not active", STATUS_FORBIDDEN);
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new HttpError(
            "Invalid username or password",
            STATUS_UNAUTHORIZED
        );
    }

    // Create and set token in cookie
    const token = createAndSetToken(req, res, user);

    res.status(200).json({ success: true, token });
});

// Logout route: /logout
const logout = asyncHandler(async (req, res, next) => {
    res.clearCookie("token", "", { expires: new Date(0) });
    res.status(STATUS_OK).json({
        success: true,
        message: "Logged out successfully",
    });
});

module.exports = { login, logout };
