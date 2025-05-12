import SpitchService from "@/services/spitch.service"

import catchAsync from "@/utils/catchAsync"
import sendResponse from "@/utils/sendResponse"

const spitchService = new SpitchService()

export const translate = catchAsync(async (req, res) => {
  const { text, source, target } = req.body

  const data = await spitchService.translate({ text, source, target })

  sendResponse({ res, statusCode: 200, data })
})

export const transcribe = catchAsync(async (req, res) => {
  const { audio, language } = req.body

  const data = await spitchService.transcribe({ language, audio })
  sendResponse({ res, statusCode: 200, data })
})

export const textToSpeech = catchAsync(async (req, res) => {
  const { text, language } = req.body

  const data = await spitchService.textToSpeech({ text, language })

  sendResponse({ res, statusCode: 200, data })
})
