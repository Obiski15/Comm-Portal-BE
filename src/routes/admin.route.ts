import { createClass } from "@/controllers/class.controller"
import {
  getInvite,
  getInvites,
  sendInvite,
} from "@/controllers/invite.controller"
import protect from "@/middlewares/auth/protect"
import validateRole from "@/middlewares/auth/validateRole"
import { Router } from "express"

const router = Router()

router.post("/class", protect, validateRole("admin"), createClass)

// invites
router
  .route("/invites")
  .post(protect, validateRole("admin"), sendInvite)
  .get(getInvites)
router.route("/invites/:id").get(protect, validateRole("admin"), getInvite)

export default router
