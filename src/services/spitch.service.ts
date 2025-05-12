import config from "@/config"
import Spitch, { toFile } from "spitch"
import { SpeechGenerateParams } from "spitch/resources/speech"
import { TextTranslateParams } from "spitch/resources/text"

import { SPITCH_VOICES } from "@/utils/lib/constants"
import { getRandomNumber } from "@/utils/lib/helpers"

interface ITranslate {
  text: string
  source: TextTranslateParams["source"]
  target: TextTranslateParams["target"]
}

interface ITranscribe {
  language: SpeechGenerateParams["language"]
  audio: ArrayBuffer
}

interface ITextToSpeech {
  text: string
  language: SpeechGenerateParams["language"]
}

export default class SpitchService {
  apiKey: string

  client: Spitch

  constructor() {
    this.apiKey = config.SPITCH.key
    this.client = new Spitch({ apiKey: this.apiKey })
  }

  async translate({ text, source, target }: ITranslate) {
    const res = await this.client.text.translate({
      text,
      source,
      target,
    })

    return { text: res.text }
  }

  async transcribe({ language, audio }: ITranscribe) {
    const file = await toFile(audio)

    const res = await this.client.speech.transcribe({
      content: file,
      language,
    })

    return { text: res.text }
  }

  async textToSpeech({ text, language }: ITextToSpeech) {
    const res = await this.client.speech.generate({
      text,
      language,
      voice:
        SPITCH_VOICES[language][
          getRandomNumber(0, SPITCH_VOICES[language].length)
        ],
    })

    const blob = await res.blob()

    const buffer = Buffer.from(await blob.arrayBuffer())

    return { base64: buffer.toString("base64") }
  }
}
