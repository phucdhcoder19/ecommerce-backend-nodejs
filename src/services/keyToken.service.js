"use strict";
const keyTokenModel = require("../models/keytoken.model");
const { mongoose } = require("mongoose");
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

  findByUserId = async (userId) => {
    return await keyTokenModel
      .findOne({ user: new mongoose.Types.ObjectId(userId) })
      .lean();
  };

  removeById = async (id) => {
    return await keyTokenModel
      .deleteOne({ _id: new mongoose.Types.ObjectId(id) })
      .lean();
  };

  findByRefreshTokenUsed = async (refreshToken) => {
    return await keyTokenModel
      .findOne({ refreshTokensUsed: refreshToken })
      .lean();
  };

  deleteKeyById = async (userId) => {
    return await keyTokenModel
      .findOneAndDelete({
        user: new mongoose.Types.ObjectId(userId),
      })
      .lean();
  };

  findByRefreshToken = async (refreshToken) => {
    return await keyTokenModel.findOne({ refreshToken }).lean();
  };

  updateRefreshToken = async (id, { refreshToken, refreshTokenUsed }) => {
    return keyTokenModel.updateOne(
      { _id: id },
      {
        $set: { refreshToken },
        $addToSet: { refreshTokensUsed: refreshTokenUsed },
      }
    );
  };
}
module.exports = new KeyTokenService();
