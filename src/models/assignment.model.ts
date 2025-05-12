import mongoose, { Schema } from "mongoose"

const assignmentSchema = new Schema(
  {
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: String,
    description: String,
    dueDate: Number,
    attachments: [{ url: String, fileName: String }],
    submissions: {
      type: [
        {
          student: { type: Schema.Types.ObjectId, ref: "User" },
          content: String,
          images: [{ url: String, fileName: String }],
          grade: Number,
          status: String,
          submittedAt: Number,
        },
      ],
    },
  },
  { timestamps: true }
)

const Assignment = mongoose.model("Assignment", assignmentSchema)

export default Assignment
