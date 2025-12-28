"use strict";
const { createClient } = require("redis");

class RedisPubSubService {
  constructor() {
    this.subClient = createClient();
    this.pubClient = createClient();

    this.subClient.connect();
    this.pubClient.connect();
  }

  async publish(channel, message) {
    return await this.pubClient.publish(channel, message);
  }

  async subscribe(channel, callback) {
    await this.subClient.subscribe(channel, (message) => {
      callback(message);
    });
  }
}

module.exports = RedisPubSubService;
