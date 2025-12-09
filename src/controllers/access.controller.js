"use strict";
const AccessService = require("../services/access.service");
const { OK, Created, SuccessResponse } = require("../core/success.response");
class AccessController {
  handleRefreshToken = async (req, res, next) => {
    // new SuccessResponse({
    //   message: "Get new token success",
    //   metadata: await AccessService.handleRefreshToken(req.body.refreshToken),
    // }).send(res);
    new SuccessResponse({
      message: "Get new token success",
      metadata: await AccessService.handleRefreshToken({
        refreshToken: req.refreshToken,
        user: req.user,
        keystore: req.keyStore,
      }),
    }).send(res);
  };
  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout success",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };
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
