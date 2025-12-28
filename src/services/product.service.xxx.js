"use strict";
const { BadRequestError } = require("../core/error.response");
const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const { insertInventory } = require("../models/repositories/inventory.repo");
const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishedForShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
} = require("../models/repositories/product.repo");
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils");

//define Factory class to create product instances based on type
class ProductFactory {
  /* 
    type: Electronics, Clothing, Furniture
  */
  static productRegistry = {};

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    console.log("productClass:", productClass);
    if (!productClass)
      throw new BadRequestError(`Invalid product type: ${type}`);
    return new productClass(payload).createProduct();
  }

  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type];
    console.log("productClass:", productClass);
    if (!productClass)
      throw new BadRequestError(`Invalid product type: ${type}`);
    return new productClass(payload).updateProduct(productId);
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

  static async unPublishProductByShop({ product_shop, product_id }) {
    const shop = await publishProductByShop({ product_shop, product_id });
    return shop;
  }

  //QUERY
  static async findAllPublishedForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishedForShop({ query, limit, skip });
  }

  static async searchProducts({ keySearch }) {
    return await searchProductByUser({ keySearch });
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: [
        "product_name",
        "product_price",
        "product_thumb",
        "product_shop",
      ],
    });
  }
  static async findProduct({ product_id }) {
    return await findProduct({
      product_id,
      unSelect: ["__v"],
    });
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
    const newProduct = await product.create({ ...this, _id: product_id });
    if (newProduct) {
      //add product stock to inventory
      insertInventory({
        product_id: newProduct._id,
        stock: this.product_quantity,
        shop_id: this.product_shop,
      });
    }
    return newProduct;
  }

  async updateProduct(productId, bodyUpdate) {
    return await updateProductById({
      productId,
      bodyUpdate,
      model: product,
    });
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

  async updateProduct(productId) {
    //remove attributes that are null or undefined
    const objectParams = removeUndefinedObject(this);
    //check xem update o dau
    if (objectParams.product_attributes) {
      //update child
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
        model: clothing,
      });
    }
    const updatedProduct = await super.updateProduct(
      productId,
      updateNestedObjectParser(objectParams)
    );
    return updatedProduct;
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
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Electronic", Electronic);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
