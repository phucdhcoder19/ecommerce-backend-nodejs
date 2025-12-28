"use strict";
const ProductService = require("../services/product.service.xxx");
const { SuccessResponse } = require("../core/success.response");

class ProductController {
  // createProduct = async (req, res, next) => {
  //   new SuccessResponse({
  //     message: "Create new product success",
  //     metadata: await ProductService.createProduct(req.body.product_type, {
  //       ...req.body,
  //       product_shop: req.user.userId,
  //     }),
  //   }).send(res);
  // };
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new product success",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  //update product
  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Update product success",
      metadata: await ProductService.updateProduct(
        req.body.product_type,
        req.params.productId,
        {
          ...req.body,
          product_shop: req.user.userId,
        }
      ),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish product success",
      metadata: await ProductService.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Unpublish product success",
      metadata: await ProductService.unPublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  //QUERY
  /**
   * @desc Get all drafts for shop
   * @param {Number }  limit
   * @param {Number }  skip
   * @return {JSON} SuccessResponse
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all drafts for shop success",
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublishedForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all published for shop success",
      metadata: await ProductService.findAllPublishedForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all published for shop success",
      metadata: await ProductService.searchProducts(req.params),
    }).send(res);
  };
  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all products success",
      metadata: await ProductService.findAllProducts(req.query),
    }).send(res);
  };
  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get product success",
      metadata: await ProductService.findProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
