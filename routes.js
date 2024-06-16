const express = require('express');
const { login, createUser } = require('./controllers/userController');
const authMiddleware = require('./middleware/auth');
const router = express.Router();

router.post('/login', login);
router.post('/user/new', createUser);

module.exports = router;