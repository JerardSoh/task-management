const express = require("express");
const router = express.Router();
const {
    getTasks,
    createTask,
    getTaskDetails,
    moveOpenTask,
    saveTaskPlan,
    moveTodoTask,
    moveDoingTask,
    moveBackDoingTask,
    moveDoneTask,
    moveBackDoneTask,
    updateTaskNotes,
} = require("../controllers/taskController");

const { authenticateToken } = require("../middleware/auth");

// Get all tasks
router.get("/:App_Acronym/all", authenticateToken, getTasks);

// Create a new task
router.post("/:App_Acronym/create", authenticateToken, createTask);

// Get task details
router.get("/:App_Acronym/:Task_id", authenticateToken, getTaskDetails);

// Save task plan
router.put("/:App_Acronym/:Task_id/save-plan", authenticateToken, saveTaskPlan);

// Move task open to todo
router.put(
    "/:App_Acronym/:Task_id/open-to-todo",
    authenticateToken,
    moveOpenTask
);

// Move task todo to doing
router.put(
    "/:App_Acronym/:Task_id/todo-to-doing",
    authenticateToken,
    moveTodoTask
);

// Move task doing to done
router.put(
    "/:App_Acronym/:Task_id/doing-to-done",
    authenticateToken,
    moveDoingTask
);

// Move task done to closed
router.put(
    "/:App_Acronym/:Task_id/done-to-closed",
    authenticateToken,
    moveDoneTask
);

// Move task doing back to todo
router.put(
    "/:App_Acronym/:Task_id/doing-to-todo",
    authenticateToken,
    moveBackDoingTask
);

// Move task done back to doing
router.put(
    "/:App_Acronym/:Task_id/done-to-doing",
    authenticateToken,
    moveBackDoneTask
);

// Update task notes
router.put(
    "/:App_Acronym/:Task_id/update-notes",
    authenticateToken,
    updateTaskNotes
);

module.exports = router;
