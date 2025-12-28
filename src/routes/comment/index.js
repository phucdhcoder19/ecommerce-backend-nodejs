"use strict";

const express = require("express");
const CommentController = require("../../controllers/comment.controller");
const router = express.Router();
const { authenticationV2 } = require("../../auth/authUtils");

router.use(authenticationV2);
router.post("/", CommentController.createComment);
router.get("/", CommentController.getCommentsByParentId);
router.delete("/", CommentController.deleteComment);

module.exports = router;
