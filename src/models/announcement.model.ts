import mongoose, { Schema } from "mongoose"

const announcementSchema = new Schema(
  {
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: String,
    content: String,
  },
  { timestamps: true }
)

const Announcement = mongoose.model("Announcement", announcementSchema)

export default Announcement
