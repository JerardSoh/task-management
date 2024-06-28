const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

// Constants for HTTP status codes
const STATUS_UNAUTHORIZED = 401;
const STATUS_FORBIDDEN = 403;

// Function to check if user is in a group
const checkGroup = async (username, groupname) => {
    const [result] = await db.execute(
        "SELECT * FROM usergroup WHERE username = ? AND groupname = ?",
        [username, groupname]
    );
    return result.length > 0;
};

// Middleware to authenticate token
const authenticateToken = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            throw new HttpError("Authentication failed", STATUS_UNAUTHORIZED);
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [userResult] = await db.execute(
            "SELECT * FROM users WHERE username = ?",
            [decoded.username]
        );

        if (userResult.length === 0 || !userResult[0].status) {
            throw new HttpError("Authentication failed.", STATUS_UNAUTHORIZED);
        }
        req.user = userResult[0];
        next();
    } catch (err) {
        res.clearCookie("token", "", { expires: new Date(0) });
        throw new HttpError(err.message, STATUS_UNAUTHORIZED);
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
