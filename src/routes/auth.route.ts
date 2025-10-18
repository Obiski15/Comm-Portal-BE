import { login, logout, signup } from "@/controllers/auth.controller"
import { Router } from "express"

const router = Router()

router.post("/login", login)
router.post("/signup", signup)
router.post("/logout", logout)

export default router
