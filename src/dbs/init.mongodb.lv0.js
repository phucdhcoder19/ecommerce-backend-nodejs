"use strict";
const mongoose = require("mongoose");
const connectString = `mongodb://localhost:27017/shopDev`;
mongoose
  .connect(connectString)
  .then((_) => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

module.exports = mongoose;
