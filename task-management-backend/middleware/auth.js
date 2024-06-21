const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

// Constants for HTTP status codes
const STATUS_UNAUTHORIZED = 401;
const STATUS_FORBIDDEN = 403;

// Middleware to authenticate token
const authenticateToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        throw new HttpError(
            "Authentication token not found",
            STATUS_UNAUTHORIZED
        );
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        throw new HttpError("Invalid or expired token", STATUS_FORBIDDEN);
    }
});

// Middleware to check if user is admin
const checkAdmin = asyncHandler(async (req, res, next) => {
    const username = req.user.username;

    if (!username) {
        throw new HttpError("User information is missing", STATUS_FORBIDDEN);
    }

    const [userInAdminGroup] = await db.execute(
        "SELECT * FROM usergroup WHERE username = ? AND groupname = 'admin'",
        [username]
    );
    if (userInAdminGroup.length === 0) {
        throw new HttpError(
            "Access denied. User is not an admin.",
            STATUS_FORBIDDEN
        );
    }
    next();
});

module.exports = { authenticateToken, checkAdmin };
