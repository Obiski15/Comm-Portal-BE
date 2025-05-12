import http from "http"
import express from "express"
import { Server } from "socket.io"

import { CORS_OPTIONS } from "./utils/lib/constants"
import logger from "./utils/logger"

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
  cors: { ...CORS_OPTIONS },
})

const activeUsersMap = new Map()

function emitActiveUsers() {
  io.emit("activeUsers", [...activeUsersMap.keys()])
}

io.on("connection", socket => {
  logger.info(`A user just connected, ${socket.id}`)

  const { userId } = socket.handshake.query
  if (userId) {
    activeUsersMap.set(userId, socket.id)
  }
  emitActiveUsers()

  socket.on("disconnect", () => {
    logger.info(`A user just disconnected, ${socket.id}`)

    activeUsersMap.delete(userId)
    emitActiveUsers()
  })
})

export { activeUsersMap, app, io, server }
