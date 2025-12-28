"use strict";
const { convertToObjectIdMongodb } = require("../../utils");
const { inventory } = require("../inventory.model");
const insertInventory = async ({
  product_id,
  stock,
  shop_id,
  location = "unknown",
}) => {
  return await inventory.create({
    inven_productId: product_id,
    inven_stock: stock,
    inven_shopId: shop_id,
    inven_location: location,
  });
};

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
      inven_productId: convertToObjectIdMongodb(productId),
      inven_stock: { $gte: quantity },
    },
    updateSet = {
      $inc: { inven_stock: -quantity },
      $push: {
        inven_reservations: {
          quantity,
          cartId,
          createdOn: new Date(),
        },
      },
    },
    options = { upsert: true, new: true };
  return await inventory.findOneAndUpdate(query, updateSet, options);
};

module.exports = {
  insertInventory,
  reservationInventory,
};
