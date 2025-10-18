import { Schema, Types } from "mongoose"

export interface IUserDocument {
  _id: Types.ObjectId
  googleId?: string
  full_name: string
  email: string
  image?: string
  role?: "student" | "teacher" | "parent" | "admin"
  password: string
  childOf: Schema.Types.ObjectId
  parentOf: Schema.Types.ObjectId[]
  class: Schema.Types.ObjectId
  confirm_password?: string
  password_reset_token?: string
  password_reset_token_expires_at?: number
  email_verification_token?: string
  password_last_updated_at?: number
  createdAt: string
  updatedAt: string
  isDeleted?: boolean
  deletedAt?: number
  comparePassword(userPassword: string): Promise<boolean>
  hasPasswordChanged(tokenIssuedAt: number): Promise<boolean>
  createResetToken(): string
}
