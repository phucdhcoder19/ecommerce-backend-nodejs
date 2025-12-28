const express = require("express");
const router = express.Router();
const CartController = require("../../controllers/cart.controller");

router.post("/", CartController.addToCart);
router.post("/update", CartController.update);
router.delete("/", CartController.delete);
router.get("/", CartController.listToCart);
module.exports = router;
