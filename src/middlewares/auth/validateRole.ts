import { NextFunction, Request, Response } from "express"

import AppError from "@/utils/AppError"

type Role = "student" | "teacher" | "admin" | "parent"

const validateRole =
  (...roles: Role[]) =>
  (_req: Request, res: Response, next: NextFunction) => {
    const { role } = res.locals.user

    if (!roles.includes(role)) next(new AppError("Access Denied", 403))

    next()
  }

export default validateRole
