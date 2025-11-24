"use strict";

const mongoose = require("mongoose");
const _SECONDS = 5000;
const os = require("os");
const process = require("process");
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log("numConnection", numConnection);
};

//check over load
const checkOverLoad = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    //Example maximum number of connections based on number of cores
    const maxConnections = numCores * 5;
    console.log("memoryUsage", `${(memoryUsage / 1024 / 1024).toFixed(2)} MB`);
    console.log("numConnection", numConnection);
    if (numConnection > maxConnections) {
      console.log(`Over load detected: ${numConnection} connections`);
    }
  }, _SECONDS); //Monitor every 5 seconds
};
module.exports = {
  countConnect,
  checkOverLoad,
};
