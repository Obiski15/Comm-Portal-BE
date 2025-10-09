import Class from "@/models/class.model"
import Message from "@/models/message.model"
import User from "@/models/user.model"
import { activeUsersMap, io } from "@/socket"

import CloudinaryService from "@/services/cloudinary.service"

import catchAsync from "@/utils/catchAsync"
import sendResponse from "@/utils/sendResponse"

// extracts user or class id - format `user-id|class-id`
const formatId = (id: string) => {
  return id.split("-")
}

export const getChats = catchAsync(async (_, res) => {
  const { _id: userId } = res.locals.user

  const chats = await Message.aggregate([
    // Only private messages
    { $match: { recipient: { $exists: true } } },

    // Sort newest first
    { $sort: { createdAt: -1 } },

    // Group by conversation pair
    {
      $group: {
        _id: {
          $cond: [
            { $gt: ["$sender", "$recipient"] }, // ensure consistent ordering
            { user1: "$recipient", user2: "$sender" },
            { user1: "$sender", user2: "$recipient" },
          ],
        },
        lastMessage: { $first: "$$ROOT" },
      },
    },

    // Add a field: the "other user" (whichever is not you)
    {
      $addFields: {
        otherUserId: {
          $cond: [
            { $eq: ["$lastMessage.sender", userId] },
            "$lastMessage.recipient",
            "$lastMessage.sender",
          ],
        },
      },
    },

    // Lookup that user's info
    {
      $lookup: {
        from: "users",
        localField: "otherUserId",
        foreignField: "_id",
        as: "otherUser",
      },
    },
    { $unwind: "$otherUser" },

    // Final shape
    {
      $project: {
        type: { $literal: "private" },
        content: "$lastMessage.content",
        createdAt: "$lastMessage.createdAt",
        otherUserId: "$otherUser._id",
        otherUserName: "$otherUser.name",
      },
    },
  ])

  sendResponse({ res, statusCode: 200, data: { chats } })
})

export const getRecipientsToChat = catchAsync(async (_, res) => {
  const { _id: userId, class: classId } = res.locals.user

  const recipients = await User.find({
    $or: [
      {
        $and: [{ _id: { $ne: userId } }, { class: { $eq: classId } }],
      },
      { parentOf: { $in: [userId] } },
      { role: "admin" },
    ],
  })

  sendResponse({ res, statusCode: 200, data: { recipients } })
})

export const getMessages = catchAsync(async (req, res) => {
  const { id } = req.params
  const { _id: sender } = res.locals.user
  const [recipientType, recipient] = formatId(id)

  const messagesQuery = {
    ...(recipientType === "class"
      ? { class: recipient }
      : {
          $or: [
            { sender, recipient },
            { recipient: sender, sender: recipient },
          ],
        }),
  }

  const recipientQuery =
    recipientType === "class"
      ? Class.findById(recipient)
      : User.findById(recipient)

  const recipientInfo = await recipientQuery

  const messages = await Message.find(messagesQuery)

  sendResponse({
    res,
    statusCode: 200,
    data: {
      messages,
      recipientInfo,
    },
  })
})

export const sendMessage = catchAsync(async (req, res) => {
  const { _id: sender } = res.locals.user
  const { content } = req.body
  const { id } = req.params

  const [recipientType, recipient] = formatId(id)

  let images: { url?: string; fileName?: string }[] = []

  const data = {
    sender,
    content,
    images,
    ...(recipientType === "class" ? { class: recipient } : { recipient }),
  }

  if (req.files) {
    const files = (req.files as Express.Multer.File[]).map(({ buffer }) => {
      return {
        file: buffer,
        folderPath:
          recipientType === "class"
            ? `${id}/messages/class`
            : `/messages/users`,
        filename_override: `${recipientType}-${sender}-${recipient}-${Date.now()}`,
      }
    })

    // upload to cloud
    const result = await new CloudinaryService().uploadFiles(files)

    // assign images
    images = result.fulfilled
  }

  const message = await Message.create(data)

  // emit message to user
  const recipientSocketId = activeUsersMap.get(String(recipient))

  if (recipientSocketId) {
    io.to(recipientSocketId).emit("newMessage", message)
  }

  sendResponse({ res, statusCode: 200, data: { message } })
})
