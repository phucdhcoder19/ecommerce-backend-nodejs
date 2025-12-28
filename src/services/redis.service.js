"use strict";

const redis = require("redis");
const { promisify } = require("util");
const redisClient = redis.createClient();
const {
  reservationInventory,
} = require("../models/repositories/inventory.repo");
const pexpire = promisify(redisClient.pexpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setnx).bind(redisClient);

const acquiredLock = async (productId, quantity, cartId) => {
  const key = `lock_v2025_${productId}`;
  const retryTimes = 10;
  const expire = 3000; //3s
  for (let i = 0; i < retryTimes; i++) {
    //tao 1 key, thang nao nam giu duoc vao thanh toan
    const result = await setnxAsync(key, cartId);
    console.log("acquiredLock - result: ", result);
    if (result === 1) {
      //thao tac voi invetory
      const isReservation = await reservationInventory({
        productId,
        quantity,
        cartId,
      });
      if (isReservation.modifiedCount) {
        //dat han cho khoa
        await pexpire(key, expire);
        return key;
      }
      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (keyLock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient);
  return await delAsyncKey(keyLock);
};

module.exports = {
  acquiredLock,
  releaseLock,
};
