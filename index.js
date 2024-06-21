require("dotenv").config(); // Load environment variables
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet"); // Security headers
const rateLimit = require("express-rate-limit"); // Rate limiting
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

// Set security headers
app.use(helmet());

// Enable CORS (restrict origins in production)
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message:
        "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

// Routes
app.use("/user", authenticateToken, userRoutes);
app.use("/group", authenticateToken, checkAdmin, groupRoutes);
app.use("/", authRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
