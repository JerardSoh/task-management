const bcrypt = require("bcryptjs");
const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");

// Constants for HTTP status codes
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BAD_REQUEST = 400;
const STATUS_NOT_FOUND = 404;
const STATUS_CONFLICT = 409;

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

// Validate username
const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{4,32}$/;
    return usernameRegex.test(username);
};

// Create a new user route: /user/new
const createUser = asyncHandler(async (req, res) => {
    const { username, password, email, status, groupnames } = req.body;

    const hashedPassword = await bcrypt.hash(password, 8);
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Username validation
        if (!validateUsername(username)) {
            throw new HttpError(
                "Username must be 4-32 characters long and can only contain alphanumerics or '_'.",
                STATUS_BAD_REQUEST
            );
        }

        // Check if user already exists
        const [existingUser] = await connection.execute(
            "SELECT username FROM users WHERE username = ?",
            [username]
        );
        if (existingUser.length > 0) {
            throw new HttpError("Username already exists", STATUS_CONFLICT);
        }

        // Password validation
        if (!validatePassword(password)) {
            throw new HttpError(
                "Password must contain at least one number, one letter, and one special character, and be 8-10 characters long.",
                STATUS_BAD_REQUEST
            );
        }

        // Email validation
        if (email && !validateEmail(email)) {
            throw new HttpError("Invalid email address", STATUS_BAD_REQUEST);
        }

        // Create user
        await connection.execute(
            "INSERT INTO users (username, password, email, status) VALUES (?, ?, ?, ?)",
            [username, hashedPassword, email, status]
        );

        // Add user to group
        if (groupnames && Array.isArray(groupnames) && groupnames.length > 0) {
            const values = groupnames.map((groupname) => [username, groupname]);
            const flattenedValues = values.flat();
            const placeholders = values.map(() => "(?, ?)").join(", ");

            await connection.execute(
                `INSERT INTO usergroup (username, groupname) VALUES ${placeholders}`,
                flattenedValues
            );
        }

        await connection.commit();

        res.status(STATUS_CREATED).json({
            success: true,
            message: "User created successfully",
        });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
});

// View profile route: /user/me
const viewMyProfile = asyncHandler(async (req, res) => {
    // Check if req.user is set
    if (!req.user) {
        throw new HttpError("User not found", STATUS_NOT_FOUND);
    }
    const username = req.user.username;
    const [user] = await db.execute(
        "SELECT username, email FROM users WHERE username = ?",
        [username]
    );
    if (user.length === 0) {
        throw new HttpError("User not found", STATUS_NOT_FOUND);
    }
    res.status(STATUS_OK).json({ success: true, user: user[0] });
});

// Get all users route: /user/all
const getUsers = asyncHandler(async (req, res) => {
    const [users] = await db.query(
        "SELECT users.username, users.email, users.status, GROUP_CONCAT(usergroup.groupname) AS `groups` FROM users LEFT JOIN usergroup ON users.username = usergroup.username GROUP BY users.username"
    );

    // Transform the result to convert group strings to arrays
    const result = users.map((user) => ({
        ...user,
        groups: user.groups ? user.groups.split(",") : [],
    }));
    res.status(STATUS_OK).json({ success: true, result });
});

// Update user email route: /user/me/email
const updateUserEmail = asyncHandler(async (req, res) => {
    // Check if req.user is set
    if (!req.user) {
        throw new HttpError("User not found", STATUS_NOT_FOUND);
    }
    const username = req.user.username;
    const { email } = req.body;

    // Email validation
    if (!validateEmail(email)) {
        throw new HttpError("Invalid email address", STATUS_BAD_REQUEST);
    }
    // Update email
    await db.execute("UPDATE users SET email = ? WHERE username = ?", [
        email,
        username,
    ]);
    res.status(STATUS_OK).json({
        success: true,
        message: "Email updated successfully",
        email,
    });
});

// Update user password route: /user/me/password
const updateUserPassword = asyncHandler(async (req, res) => {
    // Check if req.user is set
    if (!req.user) {
        throw new HttpError("User not found", STATUS_NOT_FOUND);
    }
    const username = req.user.username;
    const { password } = req.body;

    // Password validation
    if (!validatePassword(password)) {
        throw new HttpError(
            "Password must contain at least one number, one letter, and one special character, and be 8-10 characters long.",
            STATUS_BAD_REQUEST
        );
    }

    // Hashing password
    const hashedPassword = await bcrypt.hash(password, 8);

    await db.execute("UPDATE users SET password = ? WHERE username = ?", [
        hashedPassword,
        username,
    ]);
    res.status(STATUS_OK).json({
        success: true,
        message: "Password updated successfully",
    });
});

// Update user details (password, email, status, group) route: /user/:username/update
const updateUserDetails = asyncHandler(async (req, res) => {
    const username = req.params.username;
    const { password, email, status, groups } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Password validation and update
        if (password) {
            if (!validatePassword(password)) {
                throw new HttpError(
                    "Password must contain at least one number, one letter, and one special character, and be 8-10 characters long.",
                    STATUS_BAD_REQUEST
                );
            }
            const hashedPassword = password
                ? await bcrypt.hash(password, 8)
                : undefined;

            await connection.execute(
                "UPDATE users SET password = ? WHERE username = ?",
                [hashedPassword, username]
            );
        }

        // Email validation and update
        if (email && !validateEmail(email)) {
            throw new HttpError("Invalid email address", STATUS_BAD_REQUEST);
        }
        await connection.execute(
            "UPDATE users SET email = ? WHERE username = ?",
            [email, username]
        );

        // Update status
        if (status !== undefined) {
            await connection.execute(
                "UPDATE users SET status = ? WHERE username = ?",
                [status, username]
            );
        }
        // Update user groups
        if (Array.isArray(groups)) {
            const [usergroups] = await connection.execute(
                "SELECT groupname FROM usergroup WHERE username = ?",
                [username]
            );

            const currentGroups = usergroups.map((group) => group.groupname);
            const groupsToRemove = currentGroups.filter(
                (group) => !groups.includes(group)
            );
            const groupsToAdd = groups.filter(
                (group) => !currentGroups.includes(group)
            );

            // Remove user from old groups in bulk
            if (groupsToRemove.length > 0) {
                const removePlaceholders = groupsToRemove
                    .map(() => "?")
                    .join(",");
                await connection.execute(
                    `DELETE FROM usergroup WHERE username = ? AND groupname IN (${removePlaceholders})`,
                    [username, ...groupsToRemove]
                );
            }

            // Add user to new groups in bulk
            if (groupsToAdd.length > 0) {
                const placeholders = groupsToAdd.map(() => "(?, ?)").join(", ");
                const addValues = groupsToAdd.flatMap((group) => [
                    username,
                    group,
                ]);
                await connection.execute(
                    `INSERT INTO usergroup (username, groupname) VALUES ${placeholders}`,
                    addValues
                );
            }
        }
        await connection.commit();

        res.status(STATUS_OK).json({
            success: true,
            message: "User details updated successfully",
        });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
});

module.exports = {
    createUser,
    getUsers,
    viewMyProfile,
    updateUserEmail,
    updateUserPassword,
    updateUserDetails,
};
