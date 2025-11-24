"use strict";

const STATUS_CODE = {
  FORBIDDEN: 403,
  CONFLICT: 409,
};

const ResponseStatusCode = {
  FORBIDDEN: "bad request",
  CONFLICT: "Conflic error",
};

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class ConflicRequestError extends ErrorResponse {
  constructor(
    message = ResponseStatusCode.CONFLICT,
    statusCode = STATUS_CODE.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message = ResponseStatusCode.CONFLICT,
    statusCode = STATUS_CODE.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}
module.exports = {
  ConflicRequestError,
  BadRequestError,
};
