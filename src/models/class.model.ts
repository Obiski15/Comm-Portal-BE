import mongoose, { Schema } from "mongoose"

const classSchema = new Schema(
  {
    name: { type: String, required: true },
    subjects: { type: [String] },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    students: { type: [{ type: Schema.Types.ObjectId, ref: "User" }] },
  },
  { timestamps: true }
)

const Class = mongoose.model("Class", classSchema)

export default Class
