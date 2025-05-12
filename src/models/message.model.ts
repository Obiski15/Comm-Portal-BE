import mongoose, { Schema } from "mongoose"

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User" }, // for private messages
    class: { type: Schema.Types.ObjectId, ref: "Class" }, // for class-wide messages
    content: { type: String, required: true },
    images: { type: [{ url: String, fileName: String }] },
    // readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
)

const Message = mongoose.model("Message", messageSchema)

export default Message
