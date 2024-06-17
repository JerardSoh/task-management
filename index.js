require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes.js");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(bodyParser.json());
app.use("/", routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
