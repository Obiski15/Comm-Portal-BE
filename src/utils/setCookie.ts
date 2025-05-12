import config from "@/config"
import { CookieOptions, Response } from "express"

export default (
  res: Response,
  name: string,
  value: string,
  options: CookieOptions
) => {
  const { maxAge, ...restOptions } = options
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: config.SERVER.env === "production",
    sameSite: config.SERVER.env === "production" ? "none" : "lax",
    maxAge: maxAge ? maxAge * 1000 : undefined,
    ...restOptions,
  }

  res.cookie(name, value, cookieOptions)
}
