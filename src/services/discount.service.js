"use strict";
const { filter } = require("lodash");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discount = require("../models/discount.model");
const { findAllProducts } = require("../models/repositories/product.repo");
const { convertToObjectIdMongodb } = require("../utils");
const {
  findAllDiscountCodesUnSelect,
  findAllDiscountCodesSelect,
  checkDiscountExists,
} = require("../models/repositories/discount.repo");
/*
  Discount services
    1. - generate discount code
    2- get discount amount [user]
    3 - get all discount codes [user/admin]
    4- verify discount code [user]
    5 - delete discount code [admin] 
    6 - cancel discount code [user]

*/

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      max_value,
      max_uses,
      uses_count,
      max_uses_per_user,
      name,
      description,
      end_date,
      value,
      type,
    } = payload;
    if (
      new Date(start_date) >= new Date(end_date) ||
      new Date(end_date) < new Date()
    ) {
      throw new BadRequestError("Invalid discount period");
    }

    if (new Date(start_date) < new Date()) {
      throw new BadRequestError("Discount start date must be in the future");
    }

    //create index for code + shopId
    const foundDiscount = await discount.findOne({
      discount_code: code,
      discount_shopId: convertToObjectIdMongodb(shopId),
    });

    if (foundDiscount && foundDiscount.discount_is_active === true) {
      throw new BadRequestError("Discount code already exists");
    }

    const newDiscount = await discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: [],
      discount_shopId: shopId,
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === "all" ? [] : product_ids,
    });

    return newDiscount;
  }

  static async updateDiscountCode() {
    //...
  }

  //get all discount codes for shop
  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    //create index for code + shopId
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount code not found");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applies_to === "all") {
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    return products;
  }

  static async getAllDiscountCodesByShop({ shopId, limit, page }) {
    const discounts = await findAllDiscountCodesUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shopId"],
      model: discount,
    });
    return discounts;
  }

  /*
    Apply discount code
    product = { 
      productId: '',
      productPrice: '',
      quantity: ''  
      name
     }
  */

  static async getDiscountAmount({ code, shopId, userId, products }) {
    const foundDiscount = await checkDiscountExists({
      filter: {
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
      model: discount,
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount code not found");
    }

    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_users_used,
      discount_type,
      discount_value,
      discount_max_value,
    } = foundDiscount;
    if (!discount_is_active) {
      throw new BadRequestError("Discount code is not active");
    }

    if (!discount_max_uses) {
      throw new BadRequestError("Discount code has reached its maximum uses");
    }

    if (
      new Date() < new Date(foundDiscount.discount_start_date) ||
      new Date() > new Date(foundDiscount.discount_end_date)
    ) {
      throw new BadRequestError("Discount code is not valid at this time");
    }

    //check xem co et gia tri toi thieu hay khong
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.productPrice * product.quantity;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new BadRequestError(
          `Order total must be at least ${discount_min_order_value} to use this discount code`
        );
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userHasUsedDiscount = discount_users_used.find(
        (user) => user.userId === userId
      );
      if (userHasUsedDiscount) {
        if (userHasUsedDiscount.uses_count >= discount_max_uses_per_user) {
          throw new BadRequestError(
            "You have reached the maximum number of uses for this discount code"
          );
        }
      }
    }

    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : (totalOrder * discount_value) / 100;

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    //...
    const deleted = await discount.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId),
    });

    return deleted;
  }

  // Cancel discount code (user)
  static async cancelDiscountCode({ userId, shopId, codeId }) {
    const foundDiscount = await checkDiscountExists({
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
      model: discount,
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount code not found");
    }

    const result = await discount.findByIdAndUpdate({
      _id: foundDiscount._id,
      $pull: {
        discount_users_used: { userId: userId },
      },
      $inc: { discount_uses_count: -1, discount_max_uses: 1 },
    });
    return result;
  }
}

module.exports = DiscountService;
