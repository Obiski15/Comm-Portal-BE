import config from "@/config"
import Invite from "@/models/invite.model"
import User from "@/models/user.model"
import jwt from "jsonwebtoken"

import AppError from "@/utils/AppError"
import { signTokenAndSend } from "@/utils/auth"
import catchAsync from "@/utils/catchAsync"

export const signup = catchAsync(async (req, res, next) => {
  // check for token
  const { token } = req.query as { token: string }
  const { password, confirmPassword, fullName } = req.body

  if (!token) return next(new AppError("Missing or Invalid Invite token", 400))

  // check invitation
  const invite = await Invite.findOne({ token })

  if (!invite) return next(new AppError("Missing or Invalid Invite token", 403))

  // validate token
  let payload: jwt.JwtPayload | null = null

  try {
    payload = jwt.verify(token, config.JWT.inviteSecret) as jwt.JwtPayload
  } catch {
    return next(new AppError("Invalid invite token", 400))
  }

  if (invite.used || Date.now() > payload.exp! * 1000) {
    return next(new AppError("Expired invite token", 400))
  }

  const user = await User.create({
    confirm_password: confirmPassword,
    full_name: fullName,
    email: invite.email,
    role: invite.role,
    password,
  })

  invite.status = "accepted"
  invite.used = true
  await invite.save()

  signTokenAndSend(res, 201, user)
})

export const login = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select("+password")

  // check if user exist
  if (!user) return next(new AppError("User not found", 404))

  // confirm user password
  const isPasswordVerified = await user.comparePassword(req.body.password)

  if (!isPasswordVerified)
    return next(new AppError("Invalid Email or password", 400))

  signTokenAndSend(res, 200, user)
})

// export const forgotPassword = catchAsync(
//   async (
//     req,
//     res,
//     next:
//   ) => {
//     const user = await User.findOne({ email: req.body.email })

//     if (!user) return next(new AppError("User not found", 400))

//     // generate reset token
//     const resetToken = user.createResetToken()
//     await user.save({ validateBeforeSave: false })

//     // send email to user
//     await sendMail({
//       from: config.MAILTRAP.default.email,
//       to: req.body.email,
//       html: "",
//       subject: "",
//     })

//     sendResponse({
//       res,
//       status: "success",
//       statusCode: 200,
//       data: {
//         resetToken,
//         resetRoute: `${req.headers.origin}/reset-password/${resetToken}`,
//       },
//     })
//   }
// )

// export const resetPassword = catchAsync(
//   async (
//     req: Request<unknown, unknown, IResetPasswordSchema["body"]>,
//     res: Response,
//     next: NextFunction
//   ) => {
//     const user = await User.findOne({
//       password_reset_token: createHashToken(req.body.resetToken),
//     })

//     if (!user) return next(new AppError("Invalid reset token", 400))

//     const isTokenValid =
//       Date.now() < user.password_reset_token_expires_at!.getTime()

//     if (!isTokenValid)
//       return next(new AppError("Invalid or Expired reset token", 400))

//     user.password = req.body.password
//     user.confirm_password = req.body.confirm_password
//     user.password_reset_token = undefined
//     user.password_reset_token_expires_at = undefined
//     await user.save({ validateBeforeSave: true })

//     sendResponse({ res, status: "success", statusCode: 200 })
//   }
// )

// google auth
// export const googleAuth = passport.authenticate("google", {
//   scope: ["profile", "email"],
// })

// export const googleAuthCallback = catchAsync(async (req, res, next) => {
//   passport.authenticate(
//     "google",
//     {
//       session: false,
//     },
//     (err: unknown, user: unknown) => {
//       if (err) return next(err)
//       if (user) {
//         const { tokens } = user as {
//           tokens: { refreshToken: string; accessToken: string }
//         }

//         Object.entries(tokens).forEach(([key, value]) => {
//           setCookie(res, key, value, {
//             maxAge:
//               config.JWT[
//                 key as "refreshTokenExpiresIn" | "accessTokenExpiresIn"
//               ],
//           })
//         })
//         res.redirect(`${config.GOOGLE.authRedirect}`)
//       }
//     }
//   )(req, res, next)
// })
