import mongoose from "mongoose"

const inviteSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["student", "teacher", "parent", "admin"],
    },
    used: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "accepted", "invited"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
)

const Invite = mongoose.model("Invite", inviteSchema)

export default Invite
