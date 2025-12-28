"use strict";
const { findCartById } = require("../models/repositories/cart.repo");
const { NotFoundError, BadRequestError } = require("../core/error.response");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("../services/discount.service");
const { acquiredLock, releaseLock } = require("../services/redis.service");
const order = require("../models/order.model");
class CheckoutService {
  //login and without login
  /*
     cardId, 
      userId,
      shop_order_ids: [
        {
          shopId,
          shop_discount:[]
          items: [
             {  
                productId,
                quantity,
                price
             }
          ]     
        },
        {
          shopId,
          shop_discount:[
             {
                "shopId",
                "discountId",
                "codeId"
            
             }
          
          ]
          items: [
             {  
                productId,
                quantity,
                price
             }
          ]     
        }
     ]
  */
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    //check cart exist
    //calculate total price
    //calculate discount
    //calculate final price
    //return review order

    const foundCart = await findCartById(cartId);
    if (!foundCart) {
      throw new NotFoundError("Cart not found");
    }

    const checkout_order = {
        totalPrice: 0, //tong tien hang
        freeShip: 0, //phi van chuyen
        totalDiscount: 0, //tong giam gia
        totalCheckout: 0, //thanh toan
      },
      shop_orders_ids_new = [];
    //tinh tong tien bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const { shopId, items_product, shop_discounts } = shop_order_ids[i];
      //check product available
      const checkProductServer = await checkProductByServer(items_product);
      console.log("checkProductServer: ", checkProductServer);
      if (!checkProductServer[0]) {
        throw new NotFoundError("No products available in this shop");
      }

      //tinh toan tong tien cho shop order
      const checkoutPrice = checkProductServer.reduce((acc, product) => {
        return acc + product.price * product.quantity;
      }, 0);

      //tong tien truoc khi giam gia
      checkout_order.totalPrice += checkoutPrice;

      const itemCheckout = {
        shopId,
        shop_discounts,
        priceRaw: checkoutPrice,
        priceApllyDiscount: checkoutPrice, //gia sau giam gia
        item_products: checkProductServer,
      };

      //neu co giam gia cho shop
      //check xem co hop le hay k
      if (shop_discounts && shop_discounts.length > 0) {
        //apply discount
        //get amount discount
        const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
          codeId: shop_discounts[0]?.codeId,
          userId,
          shopId,
          products: checkProductServer,
        });

        //neu tien giam gia hop le
        checkout_order.totalDiscount += discount;
        if (discount > 0) {
          itemCheckout.priceApllyDiscount = checkoutPrice - discount;
        }
      }

      checkout_order.totalCheckout += itemCheckout.priceApllyDiscount;
      shop_orders_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_orders_ids_new,
      checkout_order,
    };
  }

  //order
  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_orders_ids_new, checkout_order } = await this.checkoutReview({
      cartId,
      userId,
      shop_order_ids,
    });

    //check lai 1 lan nua so luong san pham trong kho
    //tru so luong san pham trong kho
    //tao order
    const products = shop_orders_ids_new.flatMap(
      (order) => order.item_products
    );

    const acquireProduct = [];
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      //tru so luong san pham
      // await decreaseProductQuantity({ productId, quantity });
      const keyLock = await acquiredLock(productId, quantity, cartId);
      acquireProduct.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }
    //check neu co 1 san pham het hang trong kho
    if (acquireProduct.includes(false)) {
      throw new BadRequestError(
        "Some products are updated, please check again"
      );
    }

    const newOrder = await order.create({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_orders_ids_new,
    });

    //truong hop: neu insert thanh cong, thi xoa san pham trong cart
    if (newOrder) {
      // await removeProductInCart({ cartId, products });
    }
    return newOrder;
  }

  /*
    1. Query Oders [users]
  */

  static async getOrdersByUser({ userId, limit = 50, page = 1 }) {}

  /*
    2. Query Oders using id [users]
  */

  static async getOneOderByUser({ userId, limit = 50, page = 1 }) {}

  /*
    3. Cancel Oders using id [users]
  */

  static async cancelOrderByUser({ userId, limit = 50, page = 1 }) {}

  /* 
    4. Update Oders status [shop]
  */

  static async updateOderStatusByShop({ userId, limit = 50, page = 1 }) {}
}

module.exports = CheckoutService;
