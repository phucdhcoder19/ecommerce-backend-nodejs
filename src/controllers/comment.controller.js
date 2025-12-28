"use strict";

const CommentService = require("../services/comment.service");
const SuccessResponse = require("../core/success.response");
class CommentController {
  createComment = async (req, res, next) => {
    new SuccessResponse({
      message: "Create comment success",
      metadata: await CommentService.createComment(req.body),
    }).send(res);
  };

  getCommentsByParentId = async (req, res, next) => {
    new SuccessResponse({
      message: "Get comments by parentId success",
      metadata: await CommentService.getCommentsByParentId(req.query),
    }).send(res);
  };

  deleteComment = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete comment success",
      metadata: await CommentService.deleteComments(req.body),
    }).send(res);
  };
}

module.exports = new CommentController();
