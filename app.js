require("dotenv").config();
require("./db");

const express = require("express");
const app = express();
require("./config")(app);
const capitalize = require("./utils/capitalize");
const projectName = "backend-mealdb";

app.locals.appTitle = `${capitalize(projectName)} created with IronLauncher`;
app.use("/api", require("./routes"));

require("./error-handling")(app);

module.exports = app;
