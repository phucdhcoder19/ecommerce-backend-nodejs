"use strict";

const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  // 1. create discount code
  createDiscountCode = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new discount code success",
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.shopId,
      }),
    }).send(res);
  };
}

module.exports = new DiscountController();
