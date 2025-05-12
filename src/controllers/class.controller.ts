import Class from "@/models/class.model"

import catchAsync from "@/utils/catchAsync"
import sendResponse from "@/utils/sendResponse"

export const createClass = catchAsync(async (req, res) => {
  const userClass = await Class.create({ ...req.body })

  sendResponse({ res, statusCode: 201, data: { class: userClass } })
})

export const getClasses = catchAsync(async (_, res) => {
  sendResponse({ res, statusCode: 201, data: {} })
})
