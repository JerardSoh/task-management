const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

// Constants for HTTP status codes
const STATUS_UNAUTHORIZED = 401;
const STATUS_FORBIDDEN = 403;

// Function to check if user is in a group
const checkGroup = async (username, groupname) => {
    try {
        const [result] = await db.execute(
            "SELECT * FROM usergroup WHERE username = ? AND groupname = ?",
            [username, groupname]
        );
        return result.length > 0;
    } catch (error) {
        console.error("Error checking group:", error);
        throw error;
    }
};

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

// Middleware to require a group
const requireGroup = (groupname) => {
    return asyncHandler(async (req, res, next) => {
        const username = req.user.username;

        if (!username) {
            throw new HttpError(
                "User information is missing",
                STATUS_FORBIDDEN
            );
        }
        const isInGroup = await checkGroup(username, groupname);
        if (!isInGroup) {
            throw new HttpError(
                "You do not have permission to access this resource",
                STATUS_FORBIDDEN
            );
        }
        next();
    });
};
module.exports = { authenticateToken, requireGroup };
