import Assignment from "@/models/assignment.model"
import mongoose from "mongoose"

import CloudinaryService from "@/services/cloudinary.service"

import AppError from "@/utils/AppError"
import catchAsync from "@/utils/catchAsync"
import sendResponse from "@/utils/sendResponse"

export const getAssignments = catchAsync(async (_, res) => {
  const { class: classId, _id: studentId } = res.locals.user

  const assignments = await Assignment.aggregate([
    {
      $match: { class: new mongoose.Types.ObjectId(classId as string) },
    },

    {
      $project: {
        _id: 1,
        title: 1,
        dueDate: 1,
        class: 1,
        subject: 1,
        submissions: {
          $filter: {
            input: "$submissions",
            as: "submission",
            cond: { $eq: ["$$submission.student", studentId] },
          },
        },
      },
    },
  ])

  sendResponse({ res, statusCode: 200, data: { assignments } })
})

export const getAssignment = catchAsync(async (req, res) => {
  const { _id: userId } = res.locals.user
  const { id: assignmentId } = req.params

  const assignment = await Assignment.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(assignmentId) },
    },
    {
      $project: {
        class: 1,
        teacher: 1,
        subject: 1,
        title: 1,
        description: 1,
        dueDate: 1,
        attachments: 1,
        submissions: {
          $filter: {
            input: "$submissions",
            as: "submission",
            cond: { $eq: ["$$submission.student", userId] },
          },
        },
      },
    },
  ])

  sendResponse({ res: res, statusCode: 200, data: { assignment } })
})

export const createAssignment = catchAsync(async (req, res) => {
  const { class: classId, _id: teacherId } = res.locals.user
  const { title, description, dueDate } = req.body

  let images: { url?: string; fileName?: string }[] = []

  if (req.files) {
    const files = (req.files as Express.Multer.File[]).map(({ buffer }) => {
      return {
        file: buffer,
        folderPath: "/assignments",
        filename_override: `teacher-${teacherId}-${Date.now()}`,
      }
    })

    // upload to cloud
    const result = await new CloudinaryService().uploadImages(files)

    // assign images
    images = result.fulfilled
  }

  const assignment = await Assignment.create({
    class: classId,
    teacher: teacherId,
    title,
    description,
    dueDate,
    images,
  })

  sendResponse({ res, statusCode: 201, data: { assignment } })
})

export const submitAssignment = catchAsync(async (req, res, next) => {
  const { id: assignmentId } = req.params
  const { _id: userId } = res.locals.user
  const { content } = req.body

  // check for existing assignment
  const isAssignmentPresent = await Assignment.findOne({
    _id: assignmentId,
    "submissions.student": { $eq: userId },
  })

  if (isAssignmentPresent)
    return next(new AppError("Assignment Previously Submitted", 400))

  let images: { url?: string; fileName?: string }[] = []

  if (req.files) {
    const files = (req.files as Express.Multer.File[]).map(({ buffer }) => {
      return {
        file: buffer,
        folderPath: "/assignments",
        filename_override: `user-${userId}-${Date.now()}`,
      }
    })

    // upload to cloud
    const result = await new CloudinaryService().uploadImages(files)

    // assign images
    images = result.fulfilled
  }

  const assignment = await Assignment.findByIdAndUpdate(
    assignmentId,
    {
      $push: {
        submissions: {
          student: userId,
          content,
          images,
          submittedAt: Date.now(),
        },
      },
    },
    { new: true }
  )

  sendResponse({ res, statusCode: 200, data: { assignment } })
})

export const modifyAssignment = catchAsync(async (req, res) => {
  const { id: assignmentId } = req.params

  const assignment = await Assignment.findByIdAndUpdate(assignmentId, {
    ...req.body,
  })

  sendResponse({ res, statusCode: 200, data: { assignment } })
})

export const gradeAssignment = catchAsync(async (req, res) => {
  const { id: assignmentId } = req.params
  const { student, feedback, grade } = req.body

  const assignment = await Assignment.findOneAndUpdate(
    {
      _id: assignmentId,
      "submissions.student": student,
    },
    {
      $set: {
        "submissions.$.grade": +grade,
        "submissions.$.feedback": feedback,
      },
    },
    { new: true }
  )

  sendResponse({ res, statusCode: 200, data: { assignment } })
})

export const deleteAssignment = catchAsync(async (req, res) => {
  const { id: assignmentId } = req.params

  await Assignment.findByIdAndDelete(assignmentId, {
    new: true,
  })

  res.status(204).end()
})
