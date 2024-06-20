const jwt = require("jsonwebtoken");

// Create and set token in cookie
const createAndSetToken = (req, res, user) => {
    const ipAddress = req.ip;
    const browserType = req.headers["user-agent"];

    const token = jwt.sign(
        { username: user.username, ip: ipAddress, browser: browserType },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return token;
};

module.exports = { createAndSetToken };
