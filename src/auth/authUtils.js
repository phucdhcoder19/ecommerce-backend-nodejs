"use strict";

const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { findById } = require("../models/apikey.model");
const { findByUserId } = require("../services/keyToken.service");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "x-refresh-token",
};
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    //accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error("Error verify access token:", err);
      } else {
        console.log("Decode access token:", decode);
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  /* 
    1. Check user id missing??
    2. get access token
    3. verify token
    4. check user in db
    5. check keyStore with userId
    6. Ok all => return next
  */
  console.log("Authen Middleware running...");

  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid request");

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found key store");
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid request");
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    console.log("Decoded user from access token:", decodeUser);
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid user");
    }
    req.keyStore = keyStore;
    req.user = decodeUser;
    next();
  } catch (error) {
    throw error;
  }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /* 
    1. Check user id missing??
    2. get access token
    3. verify token
    4. check user in db
    5. check keyStore with userId
    6. Ok all => return next
  */

  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid request");

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found key store");

  const refreshToken = req.headers[HEADER.REFRESHTOKEN];

  if (refreshToken) {
    try {
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      console.log("Decoded user from access token:", decodeUser);
      if (userId !== decodeUser.userId) {
        throw new AuthFailureError("Invalid user");
      }
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid request");

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    console.log("Decoded user from access token:", decodeUser);
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid user");
    }
    req.keyStore = keyStore;
    req.user = decodeUser;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};
module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
  authenticationV2,
};
