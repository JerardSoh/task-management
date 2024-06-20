const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");

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

    // Check if password is correct
    if (user && bcrypt.compareSync(password, user.password)) {
        // Create a token
        const token = jwt.sign(
            { username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.status(200).json({ success: true, token });
    } else {
        throw new HttpError("Invalid username or password", 401);
    }
});

module.exports = { login };
