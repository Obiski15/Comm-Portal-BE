import { createClass } from "@/controllers/class.controller"
import { Router } from "express"

const router = Router()

router.post("/class", createClass)

export default router
