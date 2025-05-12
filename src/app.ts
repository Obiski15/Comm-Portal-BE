import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import morgan from "morgan"

import errorHandler from "@/utils/errorHandler"

import adminRouter from "./routes/admin.route"
import assignmentRouter from "./routes/assignment.route"
import authRouter from "./routes/auth.route"
import classRouter from "./routes/class.route"
import messageRouter from "./routes/message.route"
import spitchRouter from "./routes/spitch.route"
import userRouter from "./routes/user.route"
import { app } from "./socket"
import { CORS_OPTIONS } from "./utils/lib/constants"

app.use(morgan("dev"))

app.use(express.json())

app.use(cookieParser())

app.use(cors({ ...CORS_OPTIONS }))

app.use("/api/v1/assignments", assignmentRouter)
app.use("/api/v1/messages", messageRouter)
app.use("/api/v1/spitch", spitchRouter)
app.use("/api/v1/class", classRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/admin", adminRouter)

app.use(errorHandler)

export default app
