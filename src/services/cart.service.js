"use strict";
const { cart } = require("../models/cart.model");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { getProductById } = require("../models/repositories/product.repo");

/*
    Key Features: cart service
    - add item to cart
    - reduce product quantity by one
    - increate product quantity by one
    - remove item from cart
    - get cart
    - delete cart
    - delete cart item

*/

class CartService {
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: "active" };
    (updateOrOInsert = {
      $addToSet: { cart_products: product },
    }),
      (Options = { upsert: true, new: true });

    return await cart.findOneAndUpdate(query, updateOrOInsert, Options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
        cart_userId: userId,
        "cart_products.productId": productId,
        cart_state: "active",
      },
      updateSet = {
        $inc: { "cart_products.$.quantity": quantity },
      },
      options = { upsert: true, new: true };

    return await cart.findOneAndUpdate(query, updateSet, options);
  }

  //1. add item to cart
  static async addToCart({ userId, product = {} }) {
    const userCart = await cart.findOne({ cart_userId: userId }).lean();
    if (!userCart) {
      // create new cart for user
      return await this.createUserCart({ userId, product: product });
    }

    // neu co gio hang nhung chua co san pham trong gio hang
    if (userCart.cart_products.length === 0) {
      userCart.cart_products = [product];
      return await userCart.save();
    }

    //neu gio hang ton tai va co san pham trong gio hang
    return await this.updateUserCartQuantity({ userId, product: product });
  }
  //2. reduce product quantity by one

  //update cart
  /*
      shop_oder_ids:[
         {
            shopId,
            items: [
               {
                  productId,
                  quantity
                  price
                  old_quantiy
                  shopId
               }
            ]
          version
         }
      ]
  */

  static async addToCartV2({ userId, product }) {
    const { productId, quantity, old_quantity } =
      shop_oder_ids[0]?.item_products[0];
    //check product exist in cart
    const foundProduct = await getProductById({ productId });
    if (!foundProduct) {
      throw new NotFoundError("Product not found");
    }

    if (foundProduct.product_shop.toString() !== shop_oder_ids[0]?.shopId) {
      throw new BadRequestError("You can not add to cart from different shop");
    }

    if (quantity === 0) {
      // remove product from cart
    }

    return await this.updateUserCartQuantity({
      userId,
      product: productId,
      quantity: quantity - old_quantity,
    });
  }

  static async deleteUserCart({ userId, productId }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updateSet = {
        $pull: { cart_products: { productId: productId } },
      };

    const deleteCart = await cart.updateOne(query, updateSet);
    return deleteCart;
  }

  static async getListUserCart({ userId }) {
    return await cart
      .findOne({ cart_userId: +userId, cart_state: "active" })
      .lean();
  }
}

module.exports = CartService;
