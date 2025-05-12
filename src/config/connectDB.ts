import mongoose from "mongoose"

import config from "@/config/index"
import logger from "@/utils/logger"

let connection: { isConnected: number } = { isConnected: 0 }

export default async function connectDB() {
  if (connection.isConnected) return

  const con = await mongoose.connect(config.DB.uri, { dbName: "comm-portal" })

  connection = { isConnected: con.connections[0].readyState }

  logger.info("DB connected successfully")
}
