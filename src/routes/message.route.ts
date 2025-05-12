import {
  getChats,
  getMessages,
  getRecipientsToChat,
  sendMessage,
} from "@/controllers/message.controller"
import protect from "@/middlewares/auth/protect"
import fileUpload from "@/middlewares/fileUpload"
import { Router } from "express"

const router = Router()

router
  .route("/message/:id")
  .get(protect, getMessages)
  .post(protect, fileUpload().array("image"), sendMessage)

router.route("/chats").get(protect, getChats)
router.route("/recipients").get(protect, getRecipientsToChat)

export default router
