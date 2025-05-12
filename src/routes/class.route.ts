import { createClass } from "@/controllers/class.controller"
import { Router } from "express"

const router = Router()

router.route("/").post(createClass)

export default router
