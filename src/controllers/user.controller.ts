import catchAsync from "@/utils/catchAsync"
import sendResponse from "@/utils/sendResponse"

export const getUser = catchAsync(async (_, res) => {
  const { user } = res.locals

  sendResponse({ res, statusCode: 200, data: { user } })
})

export const updateUser = catchAsync(async (_, res) => {
  sendResponse({ res, statusCode: 200, data: {} })
})
