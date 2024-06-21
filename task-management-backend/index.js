require("dotenv").config(); // Load environment variables
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // CORS handling

const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const groupRoutes = require("./routes/groupRoutes.js");
const errorHandler = require("./utils/errorHandler");
const { authenticateToken, checkAdmin } = require("./middleware/auth");

const app = express();

// Middleware for JSON body parsing
app.use(bodyParser.json());

// Middleware for cookie parsing
app.use(cookieParser());

// Enable CORS (restrict origins in production)
//app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// Routes
app.use("/user", authenticateToken, userRoutes);
app.use("/group", authenticateToken, checkAdmin, groupRoutes);
app.use("/", authRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Serve static files from the React app
app.use(
    express.static(path.join(__dirname, "../task-management-frontend/build"))
);

// Handle any requests that don't match the API routes
app.get("*", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../task-management-frontend/build", "index.html")
    );
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
