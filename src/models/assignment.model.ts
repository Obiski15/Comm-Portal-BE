import mongoose, { Schema } from "mongoose"

const assignmentSchema = new Schema(
  {
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: String,
    description: String,
    subject: { type: String },
    dueDate: Number,
    attachments: [{ url: String, fileName: String, fileType: String }],
    submissions: {
      type: [
        {
          student: { type: Schema.Types.ObjectId, ref: "User" },
          content: String,
          files: [{ url: String, fileName: String, fileType: String }],
          grade: Number,
          status: String,
          submittedAt: Number,
          feedback: String,
        },
      ],
    },
  },
  { timestamps: true }
)

const Assignment = mongoose.model("Assignment", assignmentSchema)

export default Assignment
