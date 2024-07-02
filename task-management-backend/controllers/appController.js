const db = require("../db");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");
const { parseISO, isBefore } = require("date-fns");

// Constants for HTTP status codes
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BAD_REQUEST = 400;
const STATUS_INTERNAL_SERVER_ERROR = 500;
const STATUS_NOT_FOUND = 404;

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

// Get apps route: /app/all
const getApps = asyncHandler(async (req, res) => {
    const query = "SELECT * FROM App";
    try {
        const [apps] = await db.query(query);
        res.status(STATUS_OK).json({ success: true, apps });
    } catch (error) {
        throw new HttpError(
            "Failed to fetch apps",
            STATUS_INTERNAL_SERVER_ERROR
        );
    }
});

// Create a new app route: /app/new
const createApp = asyncHandler(async (req, res) => {
    const {
        App_Acronym,
        App_Description,
        App_Rnumber,
        App_startDate,
        App_endDate,
        App_permit_Create,
        App_permit_Open,
        App_permit_toDoList,
        App_permit_Doing,
        App_permit_Done,
    } = req.body;

    // Validate App_Acronym (Only alphanumeric characters and underscores are allowed)
    if (!App_Acronym) {
        throw new HttpError("Missing App name", STATUS_BAD_REQUEST);
    }
    if (!/^[a-zA-Z0-9_]+$/.test(App_Acronym)) {
        throw new HttpError(
            "Invalid App_Acronym. App_Acronym can only contain alphanumeric characters and underscores.",
            STATUS_BAD_REQUEST
        );
    }
    // Check duplicate App_Acronym
    const [existingApp] = await db.query(
        "SELECT * FROM App WHERE App_Acronym = ?",
        [App_Acronym]
    );
    if (existingApp.length > 0) {
        throw new HttpError("App already exists", STATUS_BAD_REQUEST);
    }

    // Validate App_Rnumber (Only positive integer and non-zero)
    if (!App_Rnumber) {
        throw new HttpError(
            "Missing App Rnumber or RNumber is 0",
            STATUS_BAD_REQUEST
        );
    }
    if (!/^[1-9]\d*$/.test(App_Rnumber)) {
        throw new HttpError(
            "Invalid App_Rnumber. App_Rnumber must be a positive integer and non-zero.",
            STATUS_BAD_REQUEST
        );
    }

    // Validate dates
    if (!App_startDate) {
        throw new HttpError("Missing App start date", STATUS_BAD_REQUEST);
    }
    if (!App_endDate) {
        throw new HttpError("Missing App end date", STATUS_BAD_REQUEST);
    }
    if (!validateDate(App_startDate) || !validateDate(App_endDate)) {
        throw new HttpError("Invalid date format", STATUS_BAD_REQUEST);
    }

    const startDate = parseISO(App_startDate);
    const endDate = parseISO(App_endDate);

    if (isBefore(endDate, startDate)) {
        throw new HttpError(
            "End date cannot be before start date",
            STATUS_BAD_REQUEST
        );
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        // Validate App_Acronym (Only alphanumeric characters and underscores are allowed)
        if (!App_Acronym) {
            throw new HttpError("Missing App name", STATUS_BAD_REQUEST);
        }
        if (!/^[a-zA-Z0-9_]+$/.test(App_Acronym)) {
            throw new HttpError(
                "Invalid App_Acronym. App_Acronym can only contain alphanumeric characters and underscores.",
                STATUS_BAD_REQUEST
            );
        }
        // Check duplicate App_Acronym
        const [existingApp] = await db.query(
            "SELECT * FROM App WHERE App_Acronym = ?",
            [App_Acronym]
        );
        if (existingApp.length > 0) {
            throw new HttpError(
                "App acronym already exists",
                STATUS_BAD_REQUEST
            );
        }

        // Validate App_Rnumber (Only positive integer and non-zero)
        if (!App_Rnumber) {
            throw new HttpError(
                "App Rnumber is 0 or missing!",
                STATUS_BAD_REQUEST
            );
        }
        if (!/^[1-9]\d*$/.test(App_Rnumber)) {
            throw new HttpError(
                "Invalid App_Rnumber. App_Rnumber must be a positive integer and non-zero.",
                STATUS_BAD_REQUEST
            );
        }

        // Validate dates
        if (!App_startDate) {
            throw new HttpError("Missing App start date", STATUS_BAD_REQUEST);
        }
        if (!App_endDate) {
            throw new HttpError("Missing App end date", STATUS_BAD_REQUEST);
        }
        if (!validateDate(App_startDate) || !validateDate(App_endDate)) {
            throw new HttpError("Invalid date format", STATUS_BAD_REQUEST);
        }

        const startDate = parseISO(App_startDate);
        const endDate = parseISO(App_endDate);

        if (isBefore(endDate, startDate)) {
            throw new HttpError(
                "End date cannot be before start date",
                STATUS_BAD_REQUEST
            );
        }

        // Insert the new app
        await connection.execute(
            "INSERT INTO App (App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                App_Acronym,
                App_Description,
                App_Rnumber,
                App_startDate,
                App_endDate,
                App_permit_Create || null,
                App_permit_Open || null,
                App_permit_toDoList || null,
                App_permit_Doing || null,
                App_permit_Done || null,
            ]
        );

        await connection.commit();

        res.status(STATUS_CREATED).json({
            success: true,
            message: "App created successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error details:", error);
        throw new HttpError(
            "Failed to create app",
            STATUS_INTERNAL_SERVER_ERROR
        );
    } finally {
        connection.release();
    }
});

// Edit app route: /app/:App_Acronym/edit
const editApp = asyncHandler(async (req, res) => {
    const {
        App_startDate,
        App_endDate,
        App_permit_Create,
        App_permit_Open,
        App_permit_toDoList,
        App_permit_Doing,
        App_permit_Done,
    } = req.body;
    const { App_Acronym } = req.params;

    // Validate App_Acronym
    if (!App_Acronym) {
        throw new HttpError("Missing App acronym", STATUS_BAD_REQUEST);
    }

    // Validate dates
    if (!App_startDate) {
        throw new HttpError("Missing App start date", STATUS_BAD_REQUEST);
    }
    if (!App_endDate) {
        throw new HttpError("Missing App end date", STATUS_BAD_REQUEST);
    }
    if (!validateDate(App_startDate) || !validateDate(App_endDate)) {
        throw new HttpError("Invalid date format", STATUS_BAD_REQUEST);
    }

    const startDate = parseISO(App_startDate);
    const endDate = parseISO(App_endDate);

    if (isBefore(endDate, startDate)) {
        throw new HttpError(
            "End date cannot be before start date",
            STATUS_BAD_REQUEST
        );
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if the app exists
        const [existingApp] = await db.query(
            "SELECT * FROM App WHERE App_Acronym = ?",
            [App_Acronym]
        );
        if (existingApp.length === 0) {
            throw new HttpError("App not found", STATUS_NOT_FOUND);
        }

        // Update the app
        await connection.execute(
            "UPDATE App SET App_startDate = ?, App_endDate = ?, App_permit_Create = ?, App_permit_Open = ?, App_permit_toDoList = ?, App_permit_Doing = ?, App_permit_Done = ? WHERE App_Acronym = ?",
            [
                App_startDate,
                App_endDate,
                App_permit_Create || null,
                App_permit_Open || null,
                App_permit_toDoList || null,
                App_permit_Doing || null,
                App_permit_Done || null,
                App_Acronym,
            ]
        );

        await connection.commit();

        res.status(STATUS_OK).json({
            success: true,
            message: "App updated successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error details:", error);
        throw new HttpError(
            "Failed to update app",
            STATUS_INTERNAL_SERVER_ERROR
        );
    } finally {
        connection.release();
    }
});

// Get app details route: /app/:App_Acronym
const getAppDetails = asyncHandler(async (req, res) => {
    const { App_Acronym } = req.params;

    // Check if the app exists
    const [app] = await db.query("SELECT * FROM App WHERE App_Acronym = ?", [
        App_Acronym,
    ]);
    if (app.length === 0) {
        throw new HttpError("App not found", STATUS_NOT_FOUND);
    }

    res.status(STATUS_OK).json({ success: true, app: app[0] });
});

module.exports = {
    createApp,
    getApps,
    editApp,
    getAppDetails,
};
