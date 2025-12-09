"use strict";

const {
  product,
  electronic,
  clothing,
  furniture,
} = require("../product.model");
const { mongoose } = require("mongoose");
const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: product_shop,
    _id: product_id,
  });

  if (!foundShop) return null;
  foundShop.isDraft = false;
  foundShop.isPublished = true;
  const saved = await foundShop.save();
  return saved; // trả về document đã cập nhật
};

const findAllPublishedForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};
module.exports = {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishedForShop,
};
