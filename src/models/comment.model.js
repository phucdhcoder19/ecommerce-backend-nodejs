"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Comment";
const COLLECTION_NAME = "Comments";

const commentSchema = new Schema(
  {
    // Comment thuộc về sản phẩm nào
    comment_productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // User comment
    comment_userId: {
      type: Number,
      default: 1,
    },

    // Nội dung comment
    comment_content: {
      type: String,
      default: "text",
    },

    // Nested set model (left - right)
    comment_left: {
      type: Number,
      default: 0,
    },

    comment_right: {
      type: Number,
      default: 0,
    },

    // Comment cha (reply)
    comment_parentId: {
      type: Schema.Types.ObjectId,
      ref: DOCUMENT_NAME,
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, commentSchema);
