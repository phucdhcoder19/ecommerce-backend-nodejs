"use strict";
const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const { findById } = require("../services/apiKey.service");
const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY].toString();
    if (!key) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    //check ObjectKey
    const objKey = await findById(key);
    if (!objKey) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    req.objKey = objKey;
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    try {
      const { objKey } = req;
      if (!objKey) {
        return res.status(403).json({
          message: "Forbidden",
        });
      }

      // Check if the user has the required permission
      if (!objKey.permissions.includes(permission)) {
        return res.status(403).json({
          message: "Forbidden",
        });
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  };
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  apiKey,
  checkPermission,
  asyncHandler,
};
