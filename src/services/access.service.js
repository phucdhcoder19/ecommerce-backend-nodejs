"use strict";
const shopModel = require("../models/shop.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const keyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { get } = require("lodash");
const { getInfoData } = require("../utils");
const { BadRequestError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};
// AccessService handles user access-related operations
class AccessService {
  /* 
   1. check email in dbs
   2. match password
   3. create accessToken, refreshToken
   4. generate tokens
   5. get data, return login
  */
  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop not registered");
    }
    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) {
      throw new BadRequestError("Password is incorrect");
    }
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await keyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey: privateKey,
      publicKey: publicKey,
      userId: userId,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email", "roles"],
        object: foundShop,
      }),
      tokens,
    };
  };
  static signUp = async ({ name, email, password }) => {
    //step 1: check email exist
    const hodelShop = await shopModel.findOne({ email }).lean();
    //lean() returns a plain JavaScript object instead of a Mongoose document
    if (hodelShop) {
      console.log("Shop already registered");
      throw new BadRequestError("Error: Shop already registered");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP], // In a real application, ensure to set the roles appropriately
    });

    if (newShop) {
      //create privatekey, publickey
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await keyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("Error: Shop already registered");
      }
      // const publicKeyObject = crypto.createPublicKey(publicKeyString);
      //step 3: create token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );
      return {
        shop: getInfoData({
          fields: ["_id", "name", "email", "roles"],
          object: newShop,
        }),
        tokens,
      };
    }
  };
}

module.exports = AccessService;
