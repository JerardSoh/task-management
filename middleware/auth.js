const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

// Middleware to authenticate token
const authenticateToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        throw new HttpError("Token not found", 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return next(new HttpError("Invalid Token", 403));
    }
});

// Middleware to check if user is admin
const checkAdmin = asyncHandler(async (req, res, next) => {
    const username = req.user.username;

    const [userInAdminGroup] = await db.execute(
        "SELECT * FROM usergroup WHERE username = ? AND groupname = 'admin'",
        [username]
    );
    if (userInAdminGroup.length === 0) {
        throw new HttpError("Access denied. User is not an admin.", 403);
    }
    next();
});

module.exports = { authenticateToken, checkAdmin };
