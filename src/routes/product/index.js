"use strict";
const express = require("express");
const ProductController = require("../../controllers/product.controller");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
//signUp
router.use(authentication);
router.post("", asyncHandler(ProductController.createProduct));
router.post(
  "/publish/:id",
  asyncHandler(ProductController.publishProductByShop)
);

//QUERY
router.get("/drafts/all", asyncHandler(ProductController.getAllDraftsForShop));
router.get(
  "/published/all",
  asyncHandler(ProductController.getAllPublishedForShop)
);

module.exports = router;
