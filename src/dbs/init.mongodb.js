"use strict";
const mongoose = require("mongoose");
const config = require("../configs/config.mongodb");
console.log("config", config);
const connectString = `mongodb://${config.db.host}:${config.db.port}/${config.db.name}`;
const { countConnect } = require("../helpers/check.connect");

mongoose
  .connect(connectString)
  .then((_) => {
    console.log("MongoDB connected");
    countConnect();
  })
  .catch((err) => console.log(err));

class Database {
  constructor() {
    this.connect();
  }

  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectString)
      .then((_) => console.log("MongoDB connected"))
      .catch((err) => console.log(err));
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
}
const instanceMongoDB = Database.getInstance();
module.exports = instanceMongoDB;
