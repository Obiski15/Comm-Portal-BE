import crypto from "crypto"
import config from "@/config"
import bcrypt from "bcryptjs"
import mongoose, { Schema } from "mongoose"

import { createHashToken } from "@/utils/auth"

import { IUserDocument } from "../types/types"

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    full_name: { type: String, trim: true, lowercase: true },
    role: {
      type: String,
      default: "student",
      required: true,
      trim: true,
      lowercase: true,
      enum: {
        message: "Invalid user role",
        values: ["student", "teacher", "parent", "admin"],
      },
    },
    childOf: { type: Schema.Types.ObjectId, ref: "User" },
    parentOf: [{ type: Schema.Types.ObjectId, ref: "User" }],
    class: { type: Schema.Types.ObjectId, ref: "Class" },
    image: { type: String },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Minimum password length is 8"],
      select: false,
    },
    confirm_password: {
      type: String,
      required: [true, "Please confirm your password"],
      minLength: [6, "Minimum password length is 8"],
    },
    password_reset_token: { type: String, select: false },
    password_reset_token_expires_at: { type: Number, select: false },
    email_verification_token: { type: String, select: false },
    password_last_updated_at: { type: Number, select: false },
  },
  {
    timestamps: true,
  }
)

userSchema.pre("save", async function (next) {
  // check if password is modified.
  if (!this.isModified("password")) next()

  // replace password with bcrypt hash
  this.password = await bcrypt.hash(this.password, config.AUTH.saltWorkFactor)

  // exclude confirm_password field
  this.confirm_password = undefined

  if (!this.isNew) this.password_last_updated_at = Date.now()

  next()
})

userSchema.methods.comparePassword = async function (
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(userPassword, this.password)
}

userSchema.methods.createResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex")

  this.password_reset_token = createHashToken(token)
  this.password_reset_token_expires_at = new Date(Date.now() + 900000)

  return token
}

userSchema.methods.hasPasswordChanged = function (tokenIssuedAt: number) {
  if (tokenIssuedAt < this.password_last_reset_updated_at) return true

  return false
}

const User = mongoose.model<IUserDocument>("User", userSchema)

export default User
