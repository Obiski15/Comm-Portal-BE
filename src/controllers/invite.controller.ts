import config from "@/config"
import Invite from "@/models/invite.model"
import jwt from "jsonwebtoken"

import catchAsync from "@/utils/catchAsync"
import sendResponse from "@/utils/sendResponse"

export const sendInvite = catchAsync(async (req, res) => {
  const { email, role } = req.body

  const token = jwt.sign(
    { email, role, type: "invite" },
    config.JWT.inviteSecret,
    {
      algorithm: config.JWT.algorithm,
      expiresIn: config.JWT.inviteExpiresIn,
    }
  )

  const invite = await Invite.create({ email, role, token })

  sendResponse({ res, statusCode: 200, data: { invite } })
})

export const getInvites = catchAsync(async (_, res) => {
  const invites = await Invite.find()
  sendResponse({ res, statusCode: 200, data: { invites } })
})

export const getInvite = catchAsync(async (req, res) => {
  const { id } = req.params
  const invite = await Invite.findById(id)
  sendResponse({ res, statusCode: 200, data: { invite } })
})
