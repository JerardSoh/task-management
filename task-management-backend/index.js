require("dotenv").config(); // Load environment variables
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // CORS handling

const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const groupRoutes = require("./routes/groupRoutes.js");
const appRoutes = require("./routes/appRoutes.js");
const planRoutes = require("./routes/planRoutes.js");
const errorHandler = require("./utils/errorHandler");
const { authenticateToken, requireGroup } = require("./middleware/auth");

const app = express();

// Middleware for JSON body parsing
app.use(express.json());

// Middleware for cookie parsing
app.use(cookieParser());

// Configure CORS
const corsOptions = {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true, // Allow credentials (cookies)
};

// Enable CORS (restrict origins in production)
app.use(cors(corsOptions));

// Enable preflight requests for all routes
app.options("*", cors());

// Routes
app.use("/user", authenticateToken, userRoutes);
app.use("/group", authenticateToken, groupRoutes);
app.use("/app", authenticateToken, appRoutes);
app.use("/plan", authenticateToken, planRoutes);

app.use("/", authRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
