const express = require("express");
const router = express.Router();
const {
    getTasks,
    createTask,
    getTaskDetails,
} = require("../controllers/taskController");
const { authenticateToken } = require("../middleware/auth");

// Get all tasks
router.get("/:App_Acronym/all", authenticateToken, getTasks);

// Create a new task
router.post("/:App_Acronym/create", authenticateToken, createTask);

// Get task details
router.get("/:App_Acronym/:Task_id", authenticateToken, getTaskDetails);

module.exports = router;
