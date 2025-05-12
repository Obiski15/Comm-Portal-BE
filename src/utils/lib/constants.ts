import cors from "cors"
import { SpeechGenerateParams } from "spitch/resources/speech"

import { allowedOrigins } from "./helpers"

export const SPITCH_VOICES: { [key: string]: SpeechGenerateParams["voice"][] } =
  {
    yo: ["sade", "funmi", "segun", "femi"],
    ha: ["hasan", "amina", "zainab", "aliyu"],
    ig: ["obinna", "ngozi", "amara", "ebuka"],
    en: ["john", "lucy", "lina", "jude", "henry", "kani"],
    am: ["hana", "tesfaye", "selam", "tena"],
  }

export const CORS_OPTIONS:
  | cors.CorsOptions
  | cors.CorsOptionsDelegate
  | undefined = {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins().includes(origin)) return cb(null, true)

    cb(new Error("Origin not allowed. Blocked by CORS..."))
  },
  credentials: true,
}
