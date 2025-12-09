"use strict";

const STATUS_CODE = {
  FORBIDDEN: 403,
  CONFLICT: 409,
  NOT_FOUND: 404,
};

const ResponseStatusCode = {
  FORBIDDEN: "bad request",
  CONFLICT: "Conflic error",
};
const ReasonPharases = {
  FORBIDDEN: "Forbidden",
  UNAUTHORIZED: "Unauthorized",
  NOT_FOUND: "Not found",
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

class AuthFailureError extends ErrorResponse {
  constructor(
    message = ReasonPharases.UNAUTHORIZED,
    statusCode = STATUS_CODE.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(
    message = ReasonPharases.NOT_FOUND,
    statusCode = STATUS_CODE.NOT_FOUND
  ) {
    super(message, statusCode);
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(
    message = ReasonPharases.FORBIDDEN,
    statusCode = STATUS_CODE.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}

module.exports = {
  ConflicRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError,
};
