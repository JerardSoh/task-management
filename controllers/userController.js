const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

const createUser = async (req, res) => {
    const { username, password, email, status, groupnames } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    try {
        const [existingUser] = await db.execute('SELECT username FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        await db.execute(
            'INSERT INTO users (username, password, email, status) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, email, status]
        );

        if (groupnames && Array.isArray(groupnames)) {
            for (const groupname of groupnames) {
                const [group] = await db.execute('SELECT groupname FROM `groups` WHERE groupname = ?', [groupname]);
                if (group.length > 0) {
                    await db.execute(
                        'INSERT INTO usergroup (username, groupname) VALUES (?, ?)',
                        [username, groupname]
                    );
                } else {
                    return res.status(400).json({ message: 'Group not found' });
                }
            }
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

module.exports = {
    login,
    createUser
};
