import User from "@/models/user.model"

import AppError from "@/utils/AppError"
import catchAsync from "@/utils/catchAsync"
import sendResponse from "@/utils/sendResponse"

export const getUser = catchAsync(async (_, res) => {
  const { user } = res.locals

  sendResponse({ res, statusCode: 200, data: { user } })
})

export const updateUser = catchAsync(async (_, res) => {
  sendResponse({ res, statusCode: 200, data: {} })
})

export const deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.body
  const user = await User.findById(userId)

  if (!user) return next(new AppError("User not found", 404))

  user.isDeleted = true
  user.deletedAt = Date.now()
  await user?.save()

  res.status(204).end()
})
