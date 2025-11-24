"use strict";
const keyTokenModel = require("../models/keytoken.model");
class KeyTokenService {
  createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      // Logic to create and store a key token
      //  const publicKeyString = publicKey.toString();
      // const tokens = await keyTokenModel.create({
      //   user: userId,
      //   publicKey: publicKey,
      //   privateKey: privateKey,
      // });
      //  return tokens ? tokens.publicKey : null;
      const filter = { user: userId };

      const update = {
        publicKey: publicKey,
        privateKey: privateKey,
        refreshTokensUsed: [],
        refreshToken,
      };

      const options = { upsert: true, new: true };
      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      console.error("Error creating key token:", error);
      throw error;
    }
  };
}
module.exports = new KeyTokenService();
