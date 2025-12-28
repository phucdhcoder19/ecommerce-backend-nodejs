"use strict";

const { NotFoundError } = require("../core/error.response");
const Comment = require("../models/comment.model");
const { convertToObjectIdMongodb } = require("../utils/index");
const { findProduct } = require("../models/repositories/product.repo");
/* 
  key features: Comment service
  - add comment [User, Shop]
  - get list comments [User, Shop]
  - delete comment [User, Shop, Admin]

*/
class CommentService {
  static async createComment({
    productId,
    userId,
    content,
    parentCommentId = null,
  }) {
    const newComment = await Comment.create({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId,
    });

    let rightValue;
    if (parentCommentId) {
      // replace comment
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        throw new NotFoundError("Parent comment not found");
      }
      rightValue = parentComment.comment_right;
      //update left - right value
      await Comment.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_right: { $gte: rightValue },
        },
        {
          $inc: { comment_right: 2 },
        }
      );
      await Comment.updateMany(
        {
          comment_productId: convertToObjectIdMongodb(productId),
          comment_left: { $gt: rightValue },
        },
        {
          $inc: { comment_left: 2 },
        }
      );
    } else {
      const maxRightValue = await Comment.findOne(
        {
          comment_productId: convertToObjectIdMongodb(productId),
        },
        "comment_right",
        { sort: { comment_right: -1 } }
      );
      if (maxRightValue) {
        rightValue = maxRightValue.comment_right + 1;
      } else {
        rightValue = 1;
      }
    }

    //insert comment
    newComment.comment_left = rightValue;
    newComment.comment_right = rightValue + 1;
    await newComment.save();
    return newComment;
  }

  static async getCommentsByParentId({ productId, parentCommentId = null }) {
    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent) {
        throw new NotFoundError("Parent comment not found");
      }

      const comments = await Comment.find({
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gt: parent.comment_left },
        comment_right: { $lt: parent.comment_right },
      })
        .select({
          comment_left: 1,
          comment_right: 1,
          comment_content: 1,
          comment_parentId: 1,
        })
        .sort({ comment_left: 1 });
      return comments;
    }

    const comments = await Comment.find({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_parentId: parentCommentId,
    })
      .select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        comment_parentId: 1,
      })
      .sort({ comment_left: 1 });
    return comments;
  }

  //delete comments
  static async deleteComments({ commentId, productId }) {
    //check the product exist in db
    const foundProduct = await findProduct({
      product_id: productId,
    });
    if (!foundProduct) {
      throw new NotFoundError("Product not found");
    }
    //1. xac dinh left, right cua comment can xoa
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    const leftValue = comment.comment_left;
    const rightValue = comment.comment_right;
    //2.tinh toan width
    const width = rightValue - leftValue + 1;
    //3.xoa comment trong khoang left right
    await Comment.deleteMany({
      comment_productId: convertToObjectIdMongodb(productId),
      comment_left: { $gte: leftValue },
      comment_right: { $lte: rightValue },
    });
    //4. cap nhat lai left va right
    await Comment.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_right: { $gt: rightValue },
      },
      {
        $inc: { comment_right: -width },
      }
    );

    await Comment.updateMany(
      {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gt: rightValue },
      },
      {
        $inc: { comment_left: -width },
      }
    );

    return true;
  }
}

module.exports = CommentService;
