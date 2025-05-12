import multer from "multer"

import AppError from "@/utils/AppError"

const fileUpload = () => {
  const storage = multer.memoryStorage()

  return multer({
    storage,
    fileFilter: (_, file, cb) => {
      const allowedFiles = ["image/png", "image/jpeg", "image/jpg"]

      if (allowedFiles.includes(file.mimetype)) return cb(null, true)

      cb(new AppError("File type not allowed", 400))
    },
    limits: {
      // 10mb max size
      fileSize: 10485760,
    },
  })
}

export default fileUpload
