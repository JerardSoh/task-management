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

// Get plans route: /plan/:App_Acronym/all
const getPlans = asyncHandler(async (req, res) => {
    const App_Acronym = req.params.App_Acronym;
    try {
        const [plans] = await db.query(
            "SELECT * FROM Plan WHERE Plan_app_Acronym = ?",
            [App_Acronym]
        );
        res.status(STATUS_OK).json({ success: true, plans });
    } catch (error) {
        throw new HttpError(
            "Failed to fetch plans",
            STATUS_INTERNAL_SERVER_ERROR
        );
    }
});

// Create a new plan route: /plan/:App_Acronym/new
const createPlan = asyncHandler(async (req, res) => {
    const { Plan_MVP_Name, Plan_startDate, Plan_endDate } = req.body;
    console.log("req.body", req.body);
    const { App_Acronym } = req.params;
    const connection = await db.getConnection();
    console.log("App_Acronym", App_Acronym);
    try {
        await connection.beginTransaction();

        // Check duplicate App_Acronym and Plan_MVP_Name
        const [existingPlan] = await db.query(
            "SELECT * FROM Plan WHERE Plan_app_Acronym = ? AND Plan_MVP_Name = ?",
            [App_Acronym, Plan_MVP_Name]
        );
        if (existingPlan.length > 0) {
            throw new HttpError("Plan already exists", STATUS_BAD_REQUEST);
        }

        // Validate dates
        if (!Plan_startDate) {
            throw new HttpError("Missing Plan start date", STATUS_BAD_REQUEST);
        }
        if (!Plan_endDate) {
            throw new HttpError("Missing Plan end date", STATUS_BAD_REQUEST);
        }
        if (!validateDate(Plan_startDate) || !validateDate(Plan_endDate)) {
            throw new HttpError("Invalid date format", STATUS_BAD_REQUEST);
        }

        const startDate = parseISO(Plan_startDate);
        const endDate = parseISO(Plan_endDate);

        if (isBefore(endDate, startDate)) {
            throw new HttpError(
                "End date cannot be before start date",
                STATUS_BAD_REQUEST
            );
        }

        // Insert the new plan
        await connection.execute(
            "INSERT INTO Plan (Plan_MVP_Name, Plan_startDate, Plan_endDate, Plan_app_Acronym) VALUES (?, ?, ?, ?)",
            [Plan_MVP_Name, Plan_startDate, Plan_endDate, App_Acronym]
        );

        await connection.commit();

        res.status(STATUS_CREATED).json({
            success: true,
            message: "Plan created successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error details:", error);
        throw new HttpError(
            "Failed to create plan",
            STATUS_INTERNAL_SERVER_ERROR
        );
    } finally {
        connection.release();
    }
});

// Get plan details route: /plan/:App_Acronym/:Plan_MVP_Name
const getPlanDetails = asyncHandler(async (req, res) => {
    const { App_Acronym, Plan_MVP_Name } = req.params;

    // Check if the plan exists
    const [plan] = await db.query(
        "SELECT * FROM Plan WHERE Plan_MVP_Name = ? AND Plan_App_Acronym = ?",
        [Plan_MVP_Name, App_Acronym]
    );
    if (plan.length === 0) {
        throw new HttpError("plan not found", STATUS_NOT_FOUND);
    }

    res.status(STATUS_OK).json({ success: true, plan: plan[0] });
});

module.exports = {
    createPlan,
    getPlans,
    getPlanDetails,
};
