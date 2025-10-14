import crypto from "crypto"
import { promisify } from "util"
import config from "@/config"
import { IUserDocument } from "@/types/types"
import { Request, Response } from "express"
import jwt from "jsonwebtoken"

import AppError from "./AppError"
import sendResponse from "./sendResponse"
import setCookie from "./setCookie"

interface IJwtPayload extends jwt.JwtPayload {
  userId: string
}

export const createHashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex")

export const getAuthToken = (value: string, req: Request) => {
  let token

  const cookie = req.cookies[value] as string | undefined
  const header = req.headers[value.toLowerCase()] as string | undefined

  if (header) {
    if (!header.startsWith("Bearer"))
      throw new AppError("Invalid auth token", 401)
    token = header.split(" ")[1]
  } else {
    token = cookie
  }

  return token ?? ""
}

export const signToken = ({
  data,
  options,
  secret,
}: {
  data: IJwtPayload
  secret: string
  options: jwt.SignOptions
}) => {
  return jwt.sign(data, secret, {
    expiresIn: options.expiresIn,
    algorithm: options.algorithm,
  })
}

export const verifyJwt = promisify(jwt.verify)

const verifyAccessToken = (req: Request) => {
  const accessToken = getAuthToken("accessToken", req)

  let token: null | IJwtPayload = null

  try {
    token = jwt.verify(accessToken, config.JWT.authSecret) as IJwtPayload
  } catch {
    token = null
  }

  return token
}

const verifyRefreshToken = (req: Request, res: Response) => {
  const refreshToken = getAuthToken("refreshToken", req)
  const token = jwt.verify(refreshToken, config.JWT.authSecret) as IJwtPayload
  const accessToken = signToken({
    data: { userId: token.userId },
    options: {
      algorithm: config.JWT.algorithm,
      expiresIn: config.JWT.accessTokenExpiresIn,
    },
    secret: config.JWT.authSecret,
  })
  setCookie(res, "accessToken", accessToken, {
    maxAge: config.COOKIES.accessTokenExpiresIn,
  })
  return token
}

export const verifyAuthTokens = (req: Request, res: Response) => {
  let token = verifyAccessToken(req)

  if (!token) {
    try {
      token = verifyRefreshToken(req, res)
    } catch {
      throw new AppError("Unauthorized", 401)
    }
  }

  return token
}

export const signAuthTokens = (userId: string) => {
  const refreshToken = signToken({
    data: { userId },
    options: {
      algorithm: config.JWT.algorithm,
      expiresIn: config.JWT.refreshTokenExpiresIn,
    },
    secret: config.JWT.authSecret,
  })
  const accessToken = signToken({
    data: { userId },
    options: {
      algorithm: config.JWT.algorithm,
      expiresIn: config.JWT.accessTokenExpiresIn,
    },
    secret: config.JWT.authSecret,
  })

  return { refreshToken, accessToken }
}

export const signTokenAndSend = (
  res: Response,
  statusCode: number,
  user: IUserDocument
) => {
  const tokens = signAuthTokens(user._id.toString())
  Object.entries(tokens).forEach(([key, value]) => {
    setCookie(res, key, value, {
      maxAge:
        config.COOKIES[
          `${key}ExpiresIn` as "refreshTokenExpiresIn" | "accessTokenExpiresIn"
        ],
    })
  })

  sendResponse({ res, statusCode, data: { user } })
}
