"use strict";
const express = require("express");
const router = express.Router();
const checkoutController = require("../../controllers/checkout.controller");

router.post("/review", checkoutController.checkout);
module.exports = router;
