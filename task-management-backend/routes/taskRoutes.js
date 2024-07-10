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
    sendEmail,
} = require("../controllers/taskController");

const { authenticateToken, requireGroup } = require("../middleware/auth");

// Get all tasks
router.get("/:App_Acronym/all", getTasks);

// Create a new task
router.post("/:App_Acronym/create", createTask);

// Get task details
router.get("/:App_Acronym/:Task_id", getTaskDetails);

// Save task plan
router.put("/:App_Acronym/:Task_id/save-plan", saveTaskPlan);

// Move task open to todo
router.put("/:App_Acronym/:Task_id/open-to-todo", moveOpenTask);

// Move task todo to doing
router.put("/:App_Acronym/:Task_id/todo-to-doing", moveTodoTask);

// Move task doing to done
router.put("/:App_Acronym/:Task_id/doing-to-done", moveDoingTask);

// Move task done to closed
router.put("/:App_Acronym/:Task_id/done-to-closed", moveDoneTask);

// Move task doing back to todo
router.put("/:App_Acronym/:Task_id/doing-to-todo", moveBackDoingTask);

// Move task done back to doing
router.put("/:App_Acronym/:Task_id/done-to-doing", moveBackDoneTask);

// Update task notes
router.put("/:App_Acronym/:Task_id/update-notes", updateTaskNotes);

// Send email
router.post("/:App_Acronym/:Task_id/send-email", sendEmail);

module.exports = router;
