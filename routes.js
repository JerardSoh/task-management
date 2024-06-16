const express = require('express');
const { login, createUser, createGroup, getGroups, getUsers } = require('./controllers/userController');
const authMiddleware = require('./middleware/auth');
const router = express.Router();

router.post('/login', login);
router.post('/user/new', createUser);
router.post('/group/new', authMiddleware, createGroup);
router.get('/users', authMiddleware, getUsers);
router.get('/groups', authMiddleware, getGroups);


module.exports = router;