import { Response } from "express"

const sendResponse = ({
  res,
  data,
  statusCode,
  error,
}: {
  res: Response
  statusCode: number
  data?: unknown
  error?: unknown
}) => {
  const payload = data ? { data } : error ? { error } : {}
  res.status(statusCode).json(payload)
}

export default sendResponse
