"use strict";
const { BadRequestError } = require("../core/error.response");
const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishedForShop,
} = require("../models/repositories/product.repo");

//define Factory class to create product instances based on type
class ProductFactory {
  /* 
    type: Electronics, Clothing, Furniture
  */
  static async createProduct(type, payload) {
    switch (type) {
      case "Electronic":
        console.log("Creating electronic product");
        return new Electronic(payload).createProduct();
      case "Clothing":
        return new Clothing(payload).createProduct();
      default:
        throw new BadRequestError(`Invalid product type: ${type}`);
    }
  }

  //query
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShop({ query, limit, skip });
  }

  //PUT
  static async publishProductByShop({ product_shop, product_id }) {
    const shop = await publishProductByShop({ product_shop, product_id });
    return shop;
  }

  //QUERY
  static async findAllPublishedForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishedForShop({ query, limit, skip });
  }
}

//define  base product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  //create new product
  async createProduct(product_id) {
    return await product.create({ ...this, _id: product_id });
  }
}

//define subclass for clothing products
class Clothing extends Product {
  async createProduct() {
    //create clothing specific attributes
    const newClothing = await clothing.create(this.product_attributes);
    if (!newClothing) {
      throw new BadRequestError("Create clothing error");
    }

    const newProduct = await super.createProduct();
    if (!newProduct) {
      throw new BadRequestError("Create product error");
    }
    return newProduct;
  }
}

//define subclass for electronic products
class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic) {
      throw new BadRequestError("Create electronic error");
    }

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) {
      throw new BadRequestError("Create product error");
    }
    return newProduct;
  }
}

module.exports = ProductFactory;
