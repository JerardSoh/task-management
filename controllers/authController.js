const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const { createAndSetToken } = require("../utils/tokenManager");

// Login route: /login
const login = asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;
    // Check if user exists
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
        username,
    ]);
    const user = rows[0];

    // Check if status is active
    if (user && user.status != true) {
        throw new HttpError("User is not active", 403);
    }

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new HttpError("Invalid username or password", 401);
    }
    // Create and set token in cookie
    const token = createAndSetToken(res, user);

    res.status(200).json({ success: true, token });
});

module.exports = { login };
