import { getUser } from "@/controllers/user.controller"
import protect from "@/middlewares/auth/protect"
import { Router } from "express"

const router = Router()

router.route("/").get(protect, getUser)

export default router
