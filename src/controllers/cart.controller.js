"use strict";
const CartService = require("../services/cart.service");
const { SuccessResponse } = require("../core/success.response");
class CartController {
  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Add to cart successfully",
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  };

  update = async (req, res, next) => {
    new SuccessResponse({
      message: "Update cart successfully",
      metadata: await CartService.updateUserCartQuantity(req.body),
    }).send(res);
  };

  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete cart successfully",
      metadata: await CartService.deleteUserCart(req.body),
    }).send(res);
  };

  listToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list cart successfully",
      metadata: await CartService.getListUserCart(req.body),
    }).send(res);
  };
}

module.exports = new CartController();
