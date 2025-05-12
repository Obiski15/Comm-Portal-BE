import { NextFunction, Request, Response } from "express"

import logger from "./logger"
import sendResponse from "./sendResponse"

interface IError extends Error {
  isOperational?: string
  status?: string
  statusCode?: number
}

function handleDevError(error: IError, res: Response) {
  logger.error(error)

  sendResponse({
    res,
    statusCode: error.statusCode ?? 500,
    error: {
      message: error.message ?? "something went wrong",
      status: error.status ?? "Fail",
      stack: error.stack,
    },
  })
}

function handleProdError(error: IError, res: Response) {
  // handle internal, jwt and db errors

  sendResponse({
    res,
    statusCode: error.statusCode ?? 500,
    error: {
      message: error.message ?? "something went wrong",
      status: error.status ?? "Fail",
    },
  })
}

const errorHandler = (
  err: IError,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const error: IError = { ...err, name: err.name, message: err.message }

  if (process.env.NODE_ENV === "development") handleDevError(error, res)

  if (process.env.NODE_ENV === "production") handleProdError(error, res)

  next()
}

export default errorHandler
