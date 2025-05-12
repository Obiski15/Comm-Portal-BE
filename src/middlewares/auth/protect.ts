import User from "@/models/user.model"

import AppError from "@/utils/AppError"
import { verifyAuthTokens } from "@/utils/auth"
import catchAsync from "@/utils/catchAsync"

const protect = catchAsync(async (req, res, next) => {
  const { userId, iat } = verifyAuthTokens(req, res)

  const user = await User.findById(userId).select("+password_last_updated_at")

  if (!user) return next(new AppError("User not found", 404))

  // check if password has been reset
  const passwordChanged = await user.hasPasswordChanged(iat! * 1000)

  if (passwordChanged)
    next(new AppError("User has changed password since last login", 401))

  // attach user to res locals
  res.locals.user = user

  next()
})

export default protect
