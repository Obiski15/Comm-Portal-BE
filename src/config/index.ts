import { SignOptions } from "jsonwebtoken"

// Validate required environment variables
if (!process.env.PORT) {
  throw new Error("PORT is not defined in the environment variables.")
}

if (!process.env.MONGO_URI || !process.env.MONGO_PASSWORD) {
  throw new Error(
    "MONGO URI or PASSWORD is not defined in the environment variables."
  )
}

const config: {
  SERVER: { port: number; env: string }
  SPITCH: { key: string }
  JWT: {
    algorithm: SignOptions["algorithm"]
    authSecret: string
    inviteSecret: string
    inviteExpiresIn: SignOptions["expiresIn"]
    refreshTokenExpiresIn: SignOptions["expiresIn"]
    accessTokenExpiresIn: SignOptions["expiresIn"]
  }
  AUTH: {
    saltWorkFactor: number
  }
  COOKIES: { refreshTokenExpiresIn: number; accessTokenExpiresIn: number }
  DB: { uri: string }
  CORS: { allowedOrigins: string[] }
  CLOUDINARY: {
    cloudName: string
    key: string
    secret: string
  }
} = {
  SERVER: {
    port: +process.env.PORT,
    env: process.env.NODE_ENV || "development",
  },
  CORS: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") ?? [],
  },
  DB: {
    uri: process.env.MONGO_URI.replace(
      "%PASSWORD%",
      process.env.MONGO_PASSWORD
    ),
  },
  AUTH: { saltWorkFactor: 10 },
  JWT: {
    algorithm: "HS256",
    authSecret: process.env.JWT_AUTH_SECRET!,
    inviteSecret: process.env.JWT_INVITE_SECRET!,
    inviteExpiresIn: process.env
      .JWT_INVITE_EXPIRES_IN as SignOptions["expiresIn"],
    refreshTokenExpiresIn: process.env
      .JWT_REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
    accessTokenExpiresIn: process.env
      .JWT_ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  },
  COOKIES: {
    refreshTokenExpiresIn: +process.env.COOKIES_REFRESH_TOKEN_EXPIRES_IN!,
    accessTokenExpiresIn: +process.env.COOKIES_ACCESS_TOKEN_EXPIRES_IN!,
  },
  SPITCH: { key: process.env.SPITCH_API_KEY! },
  CLOUDINARY: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    secret: process.env.CLOUDINARY_SECRET || "",
    key: process.env.CLOUDINARY_KEY || "",
  },
}

export default config
