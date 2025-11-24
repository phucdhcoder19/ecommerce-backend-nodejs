"use strict";
const AccessService = require("../services/access.service");
const { OK, Created, SuccessResponse } = require("../core/success.response");
class AccessController {
  login = async (req, res, next) => {
    new SuccessResponse({
      message: "Login success",
      metadata: await AccessService.login(req.body),
    }).send(res);
  };
  signUp = async (req, res, next) => {
    new Created({
      message: "Register success",
      metadata: await AccessService.signUp(req.body),
      options: { limitTime: 2 },
    }).send(res);
  };
}

module.exports = new AccessController();
