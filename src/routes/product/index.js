"use strict";
const express = require("express");
const ProductController = require("../../controllers/product.controller");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
//signUp

router.get(
  "/search/:keySearch",
  asyncHandler(ProductController.getListSearchProducts)
);
router.get("", asyncHandler(ProductController.findAllProducts));
router.get("/:product_id", asyncHandler(ProductController.findProduct));

router.use(authentication);
router.post("", asyncHandler(ProductController.createProduct));
router.patch("/:productId", asyncHandler(ProductController.updateProduct));
router.post(
  "/publish/:id",
  asyncHandler(ProductController.publishProductByShop)
);

router.post(
  "/unpublish/:id",
  asyncHandler(ProductController.unPublishProductByShop)
);

//QUERY
router.get("/drafts/all", asyncHandler(ProductController.getAllDraftsForShop));
router.get(
  "/published/all",
  asyncHandler(ProductController.getAllPublishedForShop)
);

module.exports = router;
