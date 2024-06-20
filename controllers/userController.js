const bcrypt = require("bcryptjs");
const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");

// Create a new user route: /user/new
const createUser = asyncHandler(async (req, res, next) => {
    const { username, password, email, status, groupnames } = req.body;

    // Check if user already exists
    const [existingUser] = await db.execute(
        "SELECT username FROM users WHERE username = ?",
        [username]
    );
    if (existingUser.length > 0) {
        throw new HttpError("User already exists", 409);
    }
    // Password validation
    if (!validatePassword(password)) {
        throw new HttpError(
            "Password must contain at least one number, one letter, and one special character, and be 8-10 characters long.",
            400
        );
    }

    // Hashing password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Email validation
    if (!validateEmail(email)) {
        throw new HttpError("Invalid email address", 400);
    }

    // Create user
    await db.execute(
        "INSERT INTO users (username, password, email, status) VALUES (?, ?, ?, ?)",
        [username, hashedPassword, email, status]
    );

    // Add user to group
    if (groupnames && Array.isArray(groupnames)) {
        for (const groupname of groupnames) {
            await db.execute(
                "INSERT INTO usergroup (username, groupname) VALUES (?, ?)",
                [username, groupname]
            );
        }
    }

    res.status(201).json({
        success: true,
        message: "User created successfully",
    });
});

// View profile route: /user/me
const viewMyProfile = asyncHandler(async (req, res, next) => {
    const username = req.user.username; // Assuming req.user is populated by authentication middleware
    const [user] = await db.execute(
        "SELECT username, email FROM users WHERE username = ?",
        [username]
    );
    if (user.length === 0) {
        throw new HttpError("User not found", 404);
    }
    res.status(200).json({ success: true, user: user[0] });
});

// Get all users route: /user/all
const getUsers = asyncHandler(async (req, res, next) => {
    const [users] = await db.query("SELECT username, email, status FROM users");
    res.status(200).json({ success: true, users });
});

// View profile route: /user/:username
const viewUserProfile = asyncHandler(async (req, res, next) => {
    const username = req.params.username;
    // Get user details
    const [user] = await db.execute(
        "SELECT username, email, status FROM users WHERE username = ?",
        [username]
    );

    // Check if user exists
    if (user.length === 0) {
        throw new HttpError("User not found", 404);
    }

    // Get user groups
    const [usergroups] = await db.execute(
        "SELECT groupname FROM usergroup WHERE username = ?",
        [username]
    );

    res.status(200).json({ success: true, user: user[0], groups: usergroups });
});

// Update user email route: /user/:username/email
const updateUserEmail = asyncHandler(async (req, res, next) => {
    const username = req.params.username;
    const { email } = req.body;
    // Email validation
    if (!validateEmail(email)) {
        throw new HttpError("Invalid email address", 400);
    }
    // Update email
    await db.execute("UPDATE users SET email = ? WHERE username = ?", [
        email,
        username,
    ]);
    res.status(200).json({
        success: true,
        message: "Email updated successfully",
    });
});

// Update user password route: /user/:username/password
const updateUserPassword = asyncHandler(async (req, res, next) => {
    const username = req.params.username;
    const { password } = req.body;

    // Password validation
    if (!validatePassword(password)) {
        throw new HttpError(
            "Password must contain at least one number, one letter, and one special character, and be 8-10 characters long.",
            400
        );
    }

    // Hashing password
    const hashedPassword = bcrypt.hashSync(password, 8);

    await db.execute("UPDATE users SET password = ? WHERE username = ?", [
        hashedPassword,
        username,
    ]);
    res.status(200).json({
        success: true,
        message: "Password updated successfully",
    });
});

// Update user details (password, email, status, group) route: /user/:username/update
const updateUserDetails = asyncHandler(async (req, res, next) => {
    const username = req.params.username;
    const { password, email, status, groupnames } = req.body;

    // Password validation
    if (password && !validatePassword(password)) {
        throw new HttpError(
            "Password must contain at least one number, one letter, and one special character, and be 8-10 characters long.",
            400
        );
    }
    // Hashing password
    const hashedPassword = password ? bcrypt.hashSync(password, 8) : undefined;
    // Update password
    if (password) {
        await db.execute("UPDATE users SET password = ? WHERE username = ?", [
            hashedPassword,
            username,
        ]);
    }

    // Email validation
    if (email && !validateEmail(email)) {
        throw new HttpError("Invalid email address", 400);
    }
    // Update email
    if (email) {
        await db.execute("UPDATE users SET email = ? WHERE username = ?", [
            email,
            username,
        ]);
    }

    // Update status
    if (status !== undefined) {
        await db.execute("UPDATE users SET status = ? WHERE username = ?", [
            status,
            username,
        ]);
    }

    // Add user to group
    if (Array.isArray(groupnames)) {
        for (const groupname of groupnames) {
            // Check if user is already in the group
            const [userInGroup] = await db.execute(
                "SELECT * FROM usergroup WHERE username = ? AND groupname = ?",
                [username, groupname]
            );

            // If user is not in the group, add them
            if (userInGroup.length === 0) {
                await db.execute(
                    "INSERT INTO usergroup (username, groupname) VALUES (?, ?)",
                    [username, groupname]
                );
            }
        }
    }

    res.status(200).json({
        success: true,
        message: "User details updated successfully",
    });
});

// Validate email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password
const validatePassword = (password) => {
    const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,10}$/;
    return passwordRegex.test(password);
};

module.exports = {
    createUser,
    getUsers,
    viewMyProfile,
    viewUserProfile,
    updateUserEmail,
    updateUserPassword,
    updateUserDetails,
};
