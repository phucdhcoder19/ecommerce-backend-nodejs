"use strict";

const STATUS_CODE = {
  OK: 200,
  CREATED: 201,
};

const ReasonStatusCode = {
  OK: "Success",
  CREATED: "Created",
};

class SuccessResponse {
  constructor({
    message,
    statusCode = STATUS_CODE.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    metadata = {},
  }) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode;
    this.reason = reasonStatusCode;
    this.metadata = metadata;
  }
  send(res, headers = {}) {
    return res.status(this.status).set(headers).json(this);
  }
}

class OK extends SuccessResponse {
  constructor(message, metadata) {
    super({ message, metadata });
  }
}

class Created extends SuccessResponse {
  constructor(
    message,
    statusCode = STATUS_CODE.CREATED,
    reasonStatusCode = ReasonStatusCode.CREATED,
    metadata = {},
    options = {}
  ) {
    super({ message, statusCode, reasonStatusCode, metadata });
    this.options = options;
  }
}

module.exports = {
  OK,
  Created,
  SuccessResponse,
};
