import {
  textToSpeech,
  transcribe,
  translate,
} from "@/controllers/spitch.controller"
import { Router } from "express"

const router = Router()

router.post("/text-speech", textToSpeech)
router.post("/transcribe", transcribe)
router.post("/translate", translate)

export default router
