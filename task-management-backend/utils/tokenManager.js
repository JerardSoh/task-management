const jwt = require("jsonwebtoken");

// Create and set token in cookie
const createAndSetToken = (req, res, user) => {
    // Get user-specific context
    const ipAddress = req.ip;
    const browserType = req.headers["user-agent"];

    // Define payload for JWT
    const payload = {
        username: user.username,
        ip: ipAddress,
        browser: browserType,
    };

    try {
        // Sign the JWT with a secret key and set an expiration time
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // Set the JWT as an HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true, // Mitigates XSS attacks
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        return token;
    } catch (err) {
        console.error("Error creating JWT token:", err);
        throw new Error("Unable to create authentication token");
    }
};

module.exports = { createAndSetToken };
