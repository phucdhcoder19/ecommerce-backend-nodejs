"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

const orderSchema = new Schema(
  {
    order_userId: {
      type: Number,
      required: true,
    },

    // Thông tin thanh toán
    order_checkout: {
      type: Object,
      default: {},
      /*
        {
          totalPrice,
          totalApplyDiscount,
          feeShip,
          totalCheckout
        }
      */
    },

    // Thông tin giao hàng
    order_shipping: {
      type: Object,
      default: {},
      /*
        {
          street,
          city,
          state,
          country
        }
      */
    },

    // Thông tin thanh toán (COD, banking, momo...)
    order_payment: {
      type: Object,
      default: {},
    },

    // Danh sách sản phẩm trong đơn
    order_products: {
      type: Array,
      required: true,
    },

    // Mã vận đơn
    order_trackingNumber: {
      type: String,
      default: "#0000118052022",
    },

    // Trạng thái đơn hàng
    order_status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "cancelled", "delivered"],
      default: "pending",
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: {
      createdAt: "createdOn",
      updatedAt: "modifiedOn",
    },
  }
);

module.exports = {
  order: model(DOCUMENT_NAME, orderSchema),
};
