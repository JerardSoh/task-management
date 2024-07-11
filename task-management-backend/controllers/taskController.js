require("dotenv").config();
const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const { format, parseISO, isBefore } = require("date-fns");
const { checkGroup } = require("../middleware/auth");
const nodemailer = require("nodemailer");

// Sleep function to introduce a delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Constants for HTTP status codes
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BAD_REQUEST = 400;
const STATUS_INTERNAL_SERVER_ERROR = 500;
const STATUS_NOT_FOUND = 404;
const STATUS_FORBIDDEN = 403;

// Validate date
const validateDate = (date) => {
    try {
        const parsedDate = parseISO(date);
        if (isNaN(parsedDate)) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
};

// Get all tasks route: /task/:App_Acronym/all
const getTasks = asyncHandler(async (req, res) => {
    const { App_Acronym } = req.params;
    try {
        const [tasks] = await db.query(
            "SELECT * FROM Task WHERE Task_app_Acronym = ?",
            [App_Acronym]
        );
        res.status(STATUS_OK).json({ success: true, tasks });
    } catch (error) {
        throw new HttpError(
            "Failed to fetch tasks",
            STATUS_INTERNAL_SERVER_ERROR
        );
    }
});

// Create a new task route: /task/:App_Acronym/create
const createTask = asyncHandler(async (req, res) => {
    const { Task_Name, Task_description, Task_plan } = req.body;
    const { App_Acronym } = req.params;
    const Task_creator = req.user.username;
    const Task_owner = req.user.username;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if user can create task
        const [appPermitCreate] = await db.query(
            "SELECT App_permit_Create FROM App WHERE App_Acronym = ? ",
            [App_Acronym]
        );
        const appPermitCreateGroup = appPermitCreate[0].App_permit_Create;
        const isInGroup = await checkGroup(Task_owner, appPermitCreateGroup);
        if (!isInGroup) {
            throw new HttpError(
                "You do not have permission to create task",
                STATUS_FORBIDDEN
            );
        }

        // Validate Task_Name
        if (!Task_Name) {
            throw new HttpError("Task name is required", STATUS_BAD_REQUEST);
        }

        // Get App_Rnumber from App_Acronym
        const [app] = await db.query(
            "SELECT App_Rnumber FROM App WHERE App_Acronym = ?",
            [App_Acronym]
        );
        // Create Task_id (<App_Acronym_App_Rnumber>)
        const Task_id = `${App_Acronym}_${app[0].App_Rnumber + 1}`;

        // Update App_Rnumber in App that is App_Acronym to be + 1
        await connection.execute(
            "UPDATE App SET App_Rnumber = App_Rnumber + 1 WHERE App_Acronym = ?",
            [App_Acronym]
        );

        // Create task_createDate
        const unformattedTask_createDate = new Date();
        const Task_createDate = format(
            unformattedTask_createDate,
            "yyyy-MM-dd"
        );

        // Validate create date
        if (!Task_createDate || !validateDate(Task_createDate)) {
            throw new HttpError(
                "Invalid create date format",
                STATUS_BAD_REQUEST
            );
        }

        // Set Task_state to "Open"
        const Task_state = "open";

        // Create notes with format of [Task_createDate, Task_state] Task_notes
        const Task_notes = `[${unformattedTask_createDate}, ${Task_state}] ${Task_creator} has created task.\n ##########################################################\n`;

        // Insert the new task
        await connection.execute(
            "INSERT INTO Task (Task_Name, Task_description, Task_notes, Task_id, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                Task_Name,
                Task_description,
                Task_notes,
                Task_id,
                Task_plan || null,
                App_Acronym,
                Task_state,
                Task_creator,
                Task_owner,
                Task_createDate,
            ]
        );

        await connection.commit();

        res.status(STATUS_CREATED).json({
            success: true,
            message: "Task created successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error details:", error);
        if (error instanceof HttpError) {
            throw error;
        } else {
            throw new HttpError(
                "Failed to create task",
                STATUS_INTERNAL_SERVER_ERROR
            );
        }
    } finally {
        connection.release();
    }
});

// Get task details route: /task/:App_Acronym/:Task_id
const getTaskDetails = asyncHandler(async (req, res) => {
    const { Task_id } = req.params;

    // Check if the task exists
    const [task] = await db.query("SELECT * FROM Task WHERE Task_id = ? ", [
        Task_id,
    ]);
    if (task.length === 0) {
        throw new HttpError("Task not found", STATUS_NOT_FOUND);
    }

    res.status(STATUS_OK).json({ success: true, task: task[0] });
});

// Move open task route: /task/:App_Acronym/:Task_id/open-to-todo
const moveOpenTask = asyncHandler(async (req, res) => {
    const { App_Acronym, Task_id } = req.params;
    const { Task_plan } = req.body;
    const Task_owner = req.user.username;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if user can move task from open to todo
        const [appPermitOpen] = await db.query(
            "SELECT App_permit_Open FROM App WHERE App_Acronym = ? ",
            [App_Acronym]
        );
        const appPermitOpenGroup = appPermitOpen[0].App_permit_Open;
        const isInGroup = await checkGroup(Task_owner, appPermitOpenGroup);
        if (!isInGroup) {
            throw new HttpError(
                "You do not have permission to move task from open to todo",
                STATUS_FORBIDDEN
            );
        }

        // Check if the task exists
        const [task] = await db.query("SELECT * FROM Task WHERE Task_id = ? ", [
            Task_id,
        ]);
        if (task.length === 0) {
            throw new HttpError("Task not found", STATUS_NOT_FOUND);
        }

        // Check if the task is in "Open" state
        if (task[0].Task_state !== "open") {
            throw new HttpError(
                "Task is not in 'Open' state",
                STATUS_BAD_REQUEST
            );
        }

        // Update Task_state to "To-Do"
        await connection.execute(
            "UPDATE Task SET Task_state = 'todo' WHERE Task_id = ?",
            [Task_id]
        );

        // Create notes with format of [Task_createDate, Task_state] Task_notes
        const unformattedTask_createDate = new Date();
        let addTask_notes = `[${unformattedTask_createDate}, '${task[0].Task_state}'] ${req.user.username} has released the Task.\n ##########################################################\n`;

        // Check if plan is updated and not the same as before
        if (task[0].Task_plan !== Task_plan) {
            if (Task_plan) {
                addTask_notes =
                    `[${unformattedTask_createDate}, '${task[0].Task_state}'] ${req.user.username} has updated the Task plan to ${Task_plan}.\n ##########################################################\n` +
                    addTask_notes;
            }
            await connection.execute(
                "UPDATE Task SET Task_plan = ? WHERE Task_id = ?",
                [Task_plan || null, Task_id]
            );
        }
        // Update Task_notes
        await connection.execute(
            "UPDATE Task SET Task_notes = CONCAT(?, Task_notes) WHERE Task_id = ? ",
            [addTask_notes, Task_id]
        );

        // Update Task_owner
        await connection.execute(
            "UPDATE Task SET Task_owner = ? WHERE Task_id = ?",
            [Task_owner, Task_id]
        );

        await connection.commit();

        res.status(STATUS_OK).json({
            success: true,
            message: "Task moved from 'Open' to 'To-Do' successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error details:", error);
        if (error instanceof HttpError) {
            throw error;
        } else {
            throw new HttpError(
                "Failed to move task from 'Open' to 'To-Do'",
                STATUS_INTERNAL_SERVER_ERROR
            );
        }
    } finally {
        connection.release();
    }
});

// Save task plan route: /task/:App_Acronym/:Task_id/save-plan
const saveTaskPlan = asyncHandler(async (req, res) => {
    const { App_Acronym, Task_id } = req.params;
    const { Task_plan } = req.body;
    const Task_owner = req.user.username;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if user can save task plan
        const [appPermitOpen] = await db.query(
            "SELECT App_permit_Open FROM App WHERE App_Acronym = ? ",
            [App_Acronym]
        );
        const appPermitOpenGroup = appPermitOpen[0].App_permit_Open;
        const isInGroup = await checkGroup(Task_owner, appPermitOpenGroup);
        if (!isInGroup) {
            throw new HttpError(
                "You do not have permission to save the plan",
                STATUS_FORBIDDEN
            );
        }

        // Check if the task exists
        const [task] = await db.query("SELECT * FROM Task WHERE Task_id = ? ", [
            Task_id,
        ]);
        if (task.length === 0) {
            throw new HttpError("Task not found", STATUS_NOT_FOUND);
        }

        // Update Task_plan
        await connection.execute(
            "UPDATE Task SET Task_plan = ? WHERE Task_id = ?",
            [Task_plan || null, Task_id]
        );

        let addTask_notes = "";

        // Create notes with format of [Task_createDate, Task_state] Task_notes
        const unformattedTask_createDate = new Date();
        if (task[0].Task_plan !== Task_plan) {
            if (Task_plan) {
                addTask_notes += `[${unformattedTask_createDate}, '${task[0].Task_state}'] ${req.user.username} saved Task plan to ${Task_plan}.\n ##########################################################\n`;
            } else {
                addTask_notes += `[${unformattedTask_createDate}, '${task[0].Task_state}'] ${req.user.username} removed Task plan.\n ##########################################################\n`;
            }
            // Update Task_notes
            await connection.execute(
                "UPDATE Task SET Task_notes = CONCAT(?, Task_notes) WHERE Task_id = ? ",
                [addTask_notes, Task_id]
            );
        }

        // Update Task_owner
        await connection.execute(
            "UPDATE Task SET Task_owner = ? WHERE Task_id = ?",
            [Task_owner, Task_id]
        );

        await connection.commit();

        res.status(STATUS_OK).json({
            success: true,
            message: "Task plan saved successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error details:", error);
        if (error instanceof HttpError) {
            throw error;
        } else {
            throw new HttpError(
                "Failed to save task plan",
                STATUS_INTERNAL_SERVER_ERROR
            );
        }
    } finally {
        connection.release();
    }
});

// Move task from To-do to Doing route: /task/:App_Acronym/:Task_id/todo-to-doing
const moveTodoTask = asyncHandler(async (req, res) => {
    const { App_Acronym, Task_id } = req.params;
    const Task_owner = req.user.username;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if user can move task from todo to doing
        const [appPermitToDoList] = await db.query(
            "SELECT App_permit_toDoList FROM App WHERE App_Acronym = ? ",
            [App_Acronym]
        );
        const appPermitToDoListGroup = appPermitToDoList[0].App_permit_toDoList;
        const isInGroup = await checkGroup(Task_owner, appPermitToDoListGroup);
        if (!isInGroup) {
            throw new HttpError(
                "You do not have permission to move task from todo to doing",
                STATUS_FORBIDDEN
            );
        }

        // Check if the task exists
        const [task] = await db.query("SELECT * FROM Task WHERE Task_id = ? ", [
            Task_id,
        ]);
        if (task.length === 0) {
            throw new HttpError("Task not found", STATUS_NOT_FOUND);
        }

        // Check if the task is in "To-Do" state
        if (task[0].Task_state !== "todo") {
            throw new HttpError(
                "Task is not in 'To-Do' state",
                STATUS_BAD_REQUEST
            );
        }

        // Update Task_state to "Doing"
        await connection.execute(
            "UPDATE Task SET Task_state = 'doing' WHERE Task_id = ?",
            [Task_id]
        );

        // Create notes with format of [Task_createDate, Task_state] Task_notes
        const unformattedTask_createDate = new Date();
        const addTask_notes = `[${unformattedTask_createDate}, '${task[0].Task_state}'] ${req.user.username} has acknowledged the Task.\n ##########################################################\n`;

        // Update Task_notes
        await connection.execute(
            "UPDATE Task SET Task_notes = CONCAT(?, Task_notes) WHERE Task_id = ? ",
            [addTask_notes, Task_id]
        );

        // Update Task_owner
        await connection.execute(
            "UPDATE Task SET Task_owner = ? WHERE Task_id = ?",
            [Task_owner, Task_id]
        );

        await connection.commit();

        res.status(STATUS_OK).json({
            success: true,
            message: "Task moved from 'To-Do' to 'Doing' successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error details:", error);
        if (error instanceof HttpError) {
            throw error;
        } else {
            throw new HttpError(
                "Failed to move task from 'To-Do' to 'Doing'",
                STATUS_INTERNAL_SERVER_ERROR
            );
        }
    } finally {
        connection.release();
    }
});

// Move task from Doing to Done route: /task/:App_Acronym/:Task_id/doing-to-done
const moveDoingTask = asyncHandler(async (req, res) => {
    const { App_Acronym, Task_id } = req.params;
    const Task_owner = req.user.username;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if user can move task from doing to done
        const [appPermitDoing] = await db.query(
            "SELECT App_permit_Doing FROM App WHERE App_Acronym = ? ",
            [App_Acronym]
        );
        const appPermitDoingGroup = appPermitDoing[0].App_permit_Doing;
        const isInGroup = await checkGroup(Task_owner, appPermitDoingGroup);
        if (!isInGroup) {
            throw new HttpError(
                "You do not have permission to move task from doing to done",
                STATUS_FORBIDDEN
            );
        }

        // Check if the task exists
        const [tasks] = await db.query(
            "SELECT * FROM Task WHERE Task_id = ? ",
            [Task_id]
        );
        if (tasks.length === 0) {
            throw new HttpError("Task not found", STATUS_NOT_FOUND);
        }
        const task = tasks[0];

        // Check if the task is in "Doing" state
        if (task.Task_state !== "doing") {
            throw new HttpError(
                "Task is not in 'Doing' state",
                STATUS_BAD_REQUEST
            );
        }

        // Update Task_state to "Done"
        await connection.execute(
            "UPDATE Task SET Task_state = 'done' WHERE Task_id = ?",
            [Task_id]
        );

        // Create notes with format of [Task_createDate, Task_state] Task_notes
        const unformattedTask_createDate = new Date();
        const addTask_notes = `[${unformattedTask_createDate}, '${task.Task_state}'] ${req.user.username} has completed the Task.\n ##########################################################\n`;

        // Update Task_notes
        await connection.execute(
            "UPDATE Task SET Task_notes = CONCAT(?, Task_notes) WHERE Task_id = ? ",
            [addTask_notes, Task_id]
        );

        // Update Task_owner
        await connection.execute(
            "UPDATE Task SET Task_owner = ? WHERE Task_id = ?",
            [Task_owner, Task_id]
        );

        // Start of sending email section
        const [appPermitDone] = await db.query(
            "SELECT App_permit_Done FROM App WHERE App_Acronym = ? ",
            [App_Acronym]
        );

        const appPermitDoneGroup = appPermitDone[0].App_permit_Done;
        // check if appPermitDoneGroup is not empty
        if (appPermitDoneGroup) {
            // get all users from the done group
            const [users] = await db.query(
                "SELECT username FROM usergroup WHERE groupname = ?",
                [appPermitDoneGroup]
            );
            const usernames = users.map((user) => user.username);
            // Get all user emails
            const [emails] = await db.query(
                "SELECT email FROM users WHERE username IN (?) AND status = true",
                [usernames]
            );

            // Send email to all users in the group, if there is any
            if (emails.length > 0) {
                const transporter = nodemailer.createTransport({
                    service: "outlook",
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });

                const mailOptions = {
                    from: process.env.EMAIL,
                    to: emails.map((email) => email.email).join(","),
                    subject: `${task.Task_id} has been completed!`,
                    text: `Task ${task.Task_Name} is completed by ${Task_owner}`,
                };

                await transporter.sendMail(mailOptions);
            }
        }

        await connection.commit();

        res.status(STATUS_OK).json({
            success: true,
            message: "Task moved from 'Doing' to 'Done' successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error details:", error);
        if (error instanceof HttpError) {
            throw error;
        } else {
            throw new HttpError(
                "Failed to move task from 'Doing' to 'Done'",
                STATUS_INTERNAL_SERVER_ERROR
            );
        }
    } finally {
        connection.release();
    }
});

// Move back task from Doing to To-do route: /task/:App_Acronym/:Task_id/doing-to-todo
const moveBackDoingTask = asyncHandler(async (req, res) => {
    const { App_Acronym, Task_id } = req.params;
    const Task_owner = req.user.username;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if user can move task from doing to todo
        const [appPermitDoing] = await db.query(
            "SELECT App_permit_Doing FROM App WHERE App_Acronym = ? ",
            [App_Acronym]
        );
        const appPermitDoingGroup = appPermitDoing[0].App_permit_Doing;
        const isInGroup = await checkGroup(Task_owner, appPermitDoingGroup);
        if (!isInGroup) {
            throw new HttpError(
                "You do not have permission to move task from doing to todo",
                STATUS_FORBIDDEN
            );
        }

        // Check if the task exists
        const [task] = await db.query("SELECT * FROM Task WHERE Task_id = ? ", [
            Task_id,
        ]);
        if (task.length === 0) {
            throw new HttpError("Task not found", STATUS_NOT_FOUND);
        }

        // Check if the task is in "Doing" state
        if (task[0].Task_state !== "doing") {
            throw new HttpError(
                "Task is not in 'Doing' state",
                STATUS_BAD_REQUEST
            );
        }

        // Update Task_state to "To-Do"
        await connection.execute(
            "UPDATE Task SET Task_state = 'todo' WHERE Task_id = ?",
            [Task_id]
        );

        // Create notes with format of [Task_createDate, Task_state] Task_notes
        const unformattedTask_createDate = new Date();
        const addTask_notes = `[${unformattedTask_createDate}, '${task[0].Task_state}'] ${req.user.username} has halted the Task back to To-Do.\n ##########################################################\n`;

        // Update Task_notes
        await connection.execute(
            "UPDATE Task SET Task_notes = CONCAT(?, Task_notes) WHERE Task_id = ? ",
            [addTask_notes, Task_id]
        );

        // Update Task_owner
        await connection.execute(
            "UPDATE Task SET Task_owner = ? WHERE Task_id = ?",
            [Task_owner, Task_id]
        );

        await connection.commit();

        res.status(STATUS_OK).json({
            success: true,
            message: "Task moved from 'Doing' to 'To-Do' successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error details:", error);
        if (error instanceof HttpError) {
            throw error;
        } else {
            throw new HttpError(
                "Failed to move task from 'Doing' to 'To-Do'",
                STATUS_INTERNAL_SERVER_ERROR
            );
        }
    } finally {
        connection.release();
    }
});

// Move task from done to doing route: /task/:App_Acronym/:Task_id/done-to-doing
const moveBackDoneTask = asyncHandler(async (req, res) => {
    const { App_Acronym, Task_id } = req.params;
    const Task_owner = req.user.username;
    const { Task_plan } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if user can move task from done to doing
        const [appPermitDone] = await db.query(
            "SELECT App_permit_Done FROM App WHERE App_Acronym = ? ",
            [App_Acronym]
        );
        const appPermitDoneGroup = appPermitDone[0].App_permit_Done;
        const isInGroup = await checkGroup(Task_owner, appPermitDoneGroup);
        if (!isInGroup) {
            throw new HttpError(
                "You do not have permission to move task from done to doing",
                STATUS_FORBIDDEN
            );
        }

        // Check if the task exists
        const [task] = await db.query("SELECT * FROM Task WHERE Task_id = ? ", [
            Task_id,
        ]);
        if (task.length === 0) {
            throw new HttpError("Task not found", STATUS_NOT_FOUND);
        }

        // Check if the task is in "Done" state
        if (task[0].Task_state !== "done") {
            throw new HttpError(
                "Task is not in 'Done' state",
                STATUS_BAD_REQUEST
            );
        }

        // Update Task_state to "Doing"
        await connection.execute(
            "UPDATE Task SET Task_state = 'doing' WHERE Task_id = ?",
            [Task_id]
        );

        // Create notes with format of [Task_createDate, Task_state] Task_notes
        const unformattedTask_createDate = new Date();
        let addTask_notes = "";

        // Check if plan is updated and not the same as before
        if (task[0].Task_plan !== Task_plan) {
            if (Task_plan) {
                addTask_notes += `[${unformattedTask_createDate}, '${task[0].Task_state}'] ${req.user.username} has updated the Task plan to ${Task_plan}.\n ##########################################################\n`;
            } else if (task[0].Task_plan) {
                addTask_notes += `[${unformattedTask_createDate}, '${task[0].Task_state}'] ${req.user.username} removed the Task plan.\n ##########################################################\n`;
            }
            await connection.execute(
                "UPDATE Task SET Task_plan = ? WHERE Task_id = ?",
                [Task_plan || null, Task_id]
            );
        }

        addTask_notes = `[${unformattedTask_createDate}, '${task[0].Task_state}'] ${req.user.username} has rejected the Task from done state and moved it back to doing.\n ##########################################################\n + ${addTask_notes}`;

        // Update Task_notes
        await connection.execute(
            "UPDATE Task SET Task_notes = CONCAT(?, Task_notes) WHERE Task_id = ? ",
            [addTask_notes, Task_id]
        );

        // Update Task_owner
        await connection.execute(
            "UPDATE Task SET Task_owner = ? WHERE Task_id = ?",
            [Task_owner, Task_id]
        );

        await connection.commit();

        res.status(STATUS_OK).json({
            success: true,
            message: "Task moved from 'Done' to 'Doing' successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error details:", error);
        if (error instanceof HttpError) {
            throw error;
        } else {
            throw new HttpError(
                "Failed to move task from 'Doing' to 'To-Do'",
                STATUS_INTERNAL_SERVER_ERROR
            );
        }
    } finally {
        connection.release();
    }
});

// Move task from Done to Closed route: /task/:App_Acronym/:Task_id/done-to-closed
const moveDoneTask = asyncHandler(async (req, res) => {
    const { App_Acronym, Task_id } = req.params;
    const Task_owner = req.user.username;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if user can move task from done to closed
        const [appPermitDone] = await db.query(
            "SELECT App_permit_Done FROM App WHERE App_Acronym = ? ",
            [App_Acronym]
        );
        const appPermitDoneGroup = appPermitDone[0].App_permit_Done;
        const isInGroup = await checkGroup(Task_owner, appPermitDoneGroup);
        if (!isInGroup) {
            throw new HttpError(
                "You do not have permission to move task from done to closed",
                STATUS_FORBIDDEN
            );
        }

        // Check if the task exists
        const [task] = await db.query("SELECT * FROM Task WHERE Task_id = ? ", [
            Task_id,
        ]);
        if (task.length === 0) {
            throw new HttpError("Task not found", STATUS_NOT_FOUND);
        }

        // Check if the task is in "Done" state
        if (task[0].Task_state !== "done") {
            throw new HttpError(
                "Task is not in 'Done' state",
                STATUS_BAD_REQUEST
            );
        }

        // Update Task_state to "Closed"
        await connection.execute(
            "UPDATE Task SET Task_state = 'closed' WHERE Task_id = ?",
            [Task_id]
        );

        // Create notes with format of [Task_createDate, Task_state] Task_notes
        const unformattedTask_createDate = new Date();
        const addTask_notes = `[${unformattedTask_createDate}, '${task[0].Task_state}'] ${req.user.username} has closed the Task.\n ##########################################################\n`;

        // Update Task_notes
        await connection.execute(
            "UPDATE Task SET Task_notes = CONCAT(?, Task_notes) WHERE Task_id = ? ",
            [addTask_notes, Task_id]
        );

        // Update Task_owner
        await connection.execute(
            "UPDATE Task SET Task_owner = ? WHERE Task_id = ?",
            [Task_owner, Task_id]
        );

        await connection.commit();

        res.status(STATUS_OK).json({
            success: true,
            message: "Task moved from 'Done' to 'Closed' successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error details:", error);
        if (error instanceof HttpError) {
            throw error;
        } else {
            throw new HttpError(
                "Failed to move task from 'Doing' to 'To-Do'",
                STATUS_INTERNAL_SERVER_ERROR
            );
        }
    } finally {
        connection.release();
    }
});

// Update task notes route: /task/:App_Acronym/:Task_id/update-notes
const updateTaskNotes = asyncHandler(async (req, res) => {
    const { App_Acronym, Task_id } = req.params;
    const { Task_notes, Task_state } = req.body;
    const Task_owner = req.user.username;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Get app permit group for open/todo/doing/done
        const [appPermits] = await db.query(
            "SELECT App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done FROM App WHERE App_Acronym = ? ",
            [App_Acronym]
        );
        // Check if task_state is open/todo/doing/done and user is in the group
        let appPermitGroup = "";
        if (Task_state === "open") {
            appPermitGroup = appPermits[0].App_permit_Open;
        } else if (Task_state === "todo") {
            appPermitGroup = appPermits[0].App_permit_toDoList;
        } else if (Task_state === "doing") {
            appPermitGroup = appPermits[0].App_permit_Doing;
        } else if (Task_state === "done") {
            appPermitGroup = appPermits[0].App_permit_Done;
        }
        const isInGroup = await checkGroup(Task_owner, appPermitGroup);
        if (!isInGroup) {
            throw new HttpError(
                "You do not have permission to update task notes",
                STATUS_FORBIDDEN
            );
        }

        // Check if the task exists
        const [task] = await db.query("SELECT * FROM Task WHERE Task_id = ? ", [
            Task_id,
        ]);
        if (task.length === 0) {
            throw new HttpError("Task not found", STATUS_NOT_FOUND);
        }

        // Create notes with format of [Task_createDate, Task_state] Task_notes
        const unformattedTask_createDate = new Date();
        let addTask_notes = `[${unformattedTask_createDate}, '${task[0].Task_state}'] ${req.user.username} added note: `;
        addTask_notes += `${Task_notes}\n ##########################################################\n`;

        // Update Task_notes
        await connection.execute(
            "UPDATE Task SET Task_notes = CONCAT(?, Task_notes) WHERE Task_id = ? ",
            [addTask_notes, Task_id]
        );

        // Update Task_owner
        await connection.execute(
            "UPDATE Task SET Task_owner = ? WHERE Task_id = ?",
            [Task_owner, Task_id]
        );

        await connection.commit();

        res.status(STATUS_OK).json({
            success: true,
            message: "Task notes updated successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error details:", error);
        if (error instanceof HttpError) {
            throw error;
        } else {
            throw new HttpError(
                "Failed to update task notes",
                STATUS_INTERNAL_SERVER_ERROR
            );
        }
    } finally {
        connection.release();
    }
});

// Send email to all user emails that belong to the app permit group of done | route: /task/:App_Acronym/:Task_id/send-email
const sendEmail = asyncHandler(async (req, res) => {
    const { App_Acronym, Task_id } = req.params;
    const [appPermits] = await db.query(
        "SELECT App_permit_Done FROM App WHERE App_Acronym = ? ",
        [App_Acronym]
    );
    const appPermitGroup = appPermits[0]?.App_permit_Done;
    if (!appPermitGroup) {
        return res.status(400).json({
            success: false,
            message: "No permission group found for the app",
        });
    }

    const [users] = await db.query(
        "SELECT username FROM usergroup WHERE groupname = ?",
        [appPermitGroup]
    );

    const usernames = users.map((user) => user.username);

    // Get all user emails
    const [emails] = await db.query(
        "SELECT email FROM users WHERE username IN (?) AND status = true",
        [usernames]
    );

    if (emails.length === 0) {
        return res
            .status(400)
            .json({ success: false, message: "No emails found for the users" });
    }

    // Get task details
    const [tasks] = await db.query("SELECT * FROM Task WHERE Task_id = ?", [
        Task_id,
    ]);

    const task = tasks[0];
    if (!task) {
        return res
            .status(404)
            .json({ success: false, message: "Task not found" });
    }

    // Check if the task is in "Done" state
    if (task.Task_state !== "done") {
        return res.status(400).json({
            success: false,
            message: "Task is not in 'Done' state",
        });
    }

    const transporter = nodemailer.createTransport({
        service: "outlook",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    for (const user of emails) {
        if (user.email) {
            const mailOptions = {
                from: process.env.EMAIL,
                to: user.email,
                subject: `${task.Task_id} has been completed!`,
                text:
                    `This task has been moved from Doing to Done by ${task.Task_owner}. Here are the details:\n` +
                    `Task Name: ${task.Task_Name}\n` +
                    `Task Description: ${task.Task_description}\n` +
                    `Task Plan: ${task.Task_plan}\n` +
                    `Task Creator: ${task.Task_creator}\n` +
                    `Task Owner: ${task.Task_owner}\n` +
                    `Task Create Date: ${task.Task_createDate}\n`,
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log("Email sent to:", user.email);
                await sleep(5000);
            } catch (error) {
                console.error("Error sending email to:", user.email, error);
            }
        }
    }
    res.status(200).json({
        success: true,
        message: "Emails sent successfully",
    });
});

module.exports = {
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
};
