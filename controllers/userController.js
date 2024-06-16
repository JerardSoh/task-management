const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const HttpError = require('../middleware/httpError');

// Login route: /login
const login = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (user && bcrypt.compareSync(password, user.password)) {
            // Create a token
            const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(201).json({ token });
        } else {
            throw new HttpError('Invalid username or password', 401);
        }
    } catch (error) {
        next(error);
    }
};

// Create a new user route: /user/new
const createUser = async (req, res, next) => {
    try {
        const { username, password, email, status, groupnames } = req.body;
        // Password validation
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,10}$/;
        if (!passwordRegex.test(password)) {
            throw new HttpError('Password must contain at least one number, one letter, and one special character, and be 8-10 characters long.', 400);
        }

        // Hashing password
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Check if user already exists
        const [existingUser] = await db.execute('SELECT username FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            throw new HttpError('User already exists', 409);
        }

        // Create user
        await db.execute(
            'INSERT INTO users (username, password, email, status) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, email, status]
        );
        
        // Add user to group
        if (groupnames && Array.isArray(groupnames)) {
            for (const groupname of groupnames) {
                const [group] = await db.execute('SELECT groupname FROM `groups` WHERE groupname = ?', [groupname]);
                if (group.length > 0) {
                    await db.execute(
                        'INSERT INTO usergroup (username, groupname) VALUES (?, ?)',
                        [username, groupname]
                    );
                } else {
                    throw new HttpError('Group not found', 400);
                }
            }
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        next(error);
    }
};

// Create new group route: /group/new
const createGroup = async (req, res, next) => {
    try {
        const { groupname } = req.body;
        // Check if group already exists
        const [existingGroup] = await db.execute('SELECT groupname FROM `groups` WHERE groupname = ?', [groupname]);
        if (existingGroup.length > 0) {
            throw new HttpError('Group already exists', 409);
        }
        // Create group
        await db.execute('INSERT INTO `groups` (groupname) VALUES (?)', [groupname]);
        res.status(201).json({ message: 'Group created successfully' });
    } catch (error) {
        next(error);
    }
};

// Get all groups route: /groups
const getGroups = async (req, res, next) => {
    try {
        const [groups] = await db.query('SELECT * FROM `groups`');
        res.status(201).json(groups);
    } catch (error) {
        next(error);
    }
};

// Get all users route: /users
const getUsers = async (req, res, next) => {
    try {
        const [users] = await db.query('SELECT username, email, status FROM users');
        res.status(201).json(users);
    } catch (error) {
        next(error);
    }
};

// View profile route: /user/:username
const viewProfile = async (req, res, next) => {
    try {
        const username = req.params.username;
        const [user] = await db.query('SELECT username, email FROM users WHERE username = ?', [username]);
        if (user.length === 0) {
            throw new HttpError('User not found', 404);
        }
        res.status(201).json(user[0]);
    } catch (error) {
        next(error);
    }
};

// Update user email route: /user/:username/email
const updateUserEmail = async (req, res, next) => {
    try {
        const username = req.params.username;
        const { email } = req.body;
        await db.execute('UPDATE users SET email = ? WHERE username = ?', [email, username]);
        res.status(201).json({ message: 'Email updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Update user status route: /user/:username/status
const updateUserStatus = async (req, res, next) => {
    try {
        const username = req.params.username;
        const { status } = req.body;
        await db.execute('UPDATE users SET status = ? WHERE username = ?', [status, username]);
        res.status(201).json({ message: 'Status updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Update user password route: /user/:username/password
const updateUserPassword = async (req, res, next) => {
    try {
        const username = req.params.username;
        const { password } = req.body;

        // Password validation
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,10}$/;
        if (!passwordRegex.test(password)) {
            throw new HttpError('Password must contain at least one number, one letter, and one special character, and be 8-10 characters long.', 400);
        }

        // Hashing password
        const hashedPassword = bcrypt.hashSync(password, 8);

        await db.execute('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username]);
        res.status(201).json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Assign group to user route: /user/:username/group
const assignGroup = async (req, res, next) => {
    try {
        const username = req.params.username;
        const { groupname } = req.body;
        const [group] = await db.execute('SELECT groupname FROM `groups` WHERE groupname = ?', [groupname]);
        if (group.length > 0) {
            await db.execute('INSERT INTO usergroup (username, groupname) VALUES (?, ?)', [username, groupname]);
            res.status(201).json({ message: 'Group assigned successfully' });
        } else {
            throw new HttpError('Group not found', 400);
        }
    } catch (error) {
        next(error);
    }
};


module.exports = {
    login,
    createUser,
    createGroup,
    getGroups,
    getUsers,
    viewProfile,
    updateUserEmail,
    updateUserStatus,
    updateUserPassword
};
