"use strict";

const { update } = require("lodash");
const { BadRequestError } = require("../core/error.response");
const { inventory } = require("../models/inventory.model");
const { getProductById } = require("../models/repositories/product.repo");

class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = "TP.HCM",
  }) {
    const product = await getProductById(productId);
    if (!product) {
      throw new BadRequestError("Product not found");
    }

    const query = { inventory_productId: productId, inventory_shopId: shopId },
      updateSet = {
        $inc: { inventory_stock: stock },
        $set: {
          inventory_location: location,
        },
      },
      options = { upsert: true, new: true };
    return await inventory.findOneAndUpdate(query, updateSet, options);
  }
}

module.exports = InventoryService;
