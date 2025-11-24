const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//init middlewares
//app.use(morgan("dev"));
//console.log("NODE_ENV", process.env);
app.use(morgan("combined"));
app.use(helmet());
app.use(compression());
// morgan("common");
// morgan("short");
// morgan("tiny");
//init db
require("./dbs/init.mongodb");
//const { checkOverLoad } = require("./helpers/check.connect");
//checkOverLoad();
//init routes
app.use("", require("./routes"));

app.use((err, req, res, next) => {
  console.log("err", err);
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: err.message || "Internal Server Error",
  });
});
module.exports = app;
