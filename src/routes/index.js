"use strict";
const express = require("express");
const { apiKey, checkPermission } = require("../auth/checkAuth");
const router = express.Router();
//check apiKey
router.use(apiKey);
router.use(checkPermission("0000"));
//check permission
router.use("/v1/api", require("./access"));
// router.get("", (req, res, next) => {
//   return res.status(200).json({ message: "Welcome to my API" });
// });

//authentication

module.exports = router;
