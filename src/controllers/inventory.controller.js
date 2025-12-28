"use strict";

const InvertoryService = require("../services/inventory.service");
const { BadRequestError } = require("../core/error.response");

class InventoryController {
  addStockToInventory = async (req, res, next) => {
    new SuccessResponse({
      message: "Add stock successfully",
      metadata: await InvertoryService.addStockToInventory(req.body),
    }).send(res);
  };
}

module.exports = new InventoryController();
