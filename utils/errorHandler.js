const { validationResult } = require('express-validator');
const { Prisma } = require('@prisma/client');
const { httpError } = require('../config');

function validation(req, res, next) {
  const errorFormatter = (error) => ({
    field: error.path,
    message: error.msg,
  });
  const result = validationResult(req).formatWith(errorFormatter);
  if (result.array().filter((e) => e.field === 'authorization').length > 0) {
    /* vendors contains the element we're looking for */
    return next(httpError.Unauthorized());
  }
  if (!result.isEmpty()) {
    return next(httpError.UnprocessableEntity(result.array()));
  }
  return next();
}

function prisma(e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    switch (e.code) {
      case 'P2002':
        return 'Unique constraint violation';
      case 'P2025':
        return 'Record not found';
      case 'P2014':
        return 'Null constraint violation';
      case 'P2016':
        return 'Invalid data';
      case 'P2003':
        return 'Foreign key constraint violation';
      default:
        return `Unhandled Prisma error: ${e.code}`;
    }
  } else {
    throw e;
  }
}
module.exports = {
  validation,
  prisma,
};
