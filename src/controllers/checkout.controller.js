"use strict";
const checkoutService = require("../services/checkou.service");
const { SuccessResponse } = require("../core/success.response");
class checkoutController {
  checkout = async (req, res, next) => {
    new SuccessResponse({
      message: "Checkout review successfully",
      metadata: await checkoutService.checkoutReview(req.body),
    }).send(res);
  };
}

module.exports = new checkoutController();
