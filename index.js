require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const groupRoutes = require("./routes/groupRoutes.js");
const errorHandler = require("./utils/errorHandler");
const { authenticateToken, checkAdmin } = require("./middleware/auth");
const cookieParser = require("cookie-parser");

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/user", authenticateToken, userRoutes);
app.use("/group", authenticateToken, checkAdmin, groupRoutes);
app.use("/", authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
