"use strict";
const Notification = require("../models/notification.model");
const pushNotiToSystem = async ({
  type = "SHOP-001",
  senderId = 1,
  receivedId = 1,
  content,
  options = {},
}) => {
  let noti_content;

  if (type === "SHOP-001") {
    noti_content = `A shop you follow has a new product: ${content}`;
  } else if (type === "PROMOTION-001") {
    // other type notification
    noti_content = "A shop you follow add new voucher";
  }

  const newNoti = await Notification.create({
    noti_type: type,
    noti_senderId: senderId,
    noti_receivedId: receivedId,
    noti_content,
    noti_options: options,
  });

  return newNoti;
};

module.export = {
  pushNotiToSystem,
};
