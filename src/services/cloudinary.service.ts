import config from "@/config"
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary"

// import sharp from "sharp"

import AppError from "@/utils/AppError"

export interface UploadOptions extends UploadApiOptions {
  file: Buffer
  folderPath?: string
}

export default class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: config.CLOUDINARY.cloudName,
      api_key: config.CLOUDINARY.key,
      api_secret: config.CLOUDINARY.secret,
    })
  }

  async uploadFile({
    file,
    folderPath = "/",
    ...options
  }: UploadOptions): Promise<UploadApiResponse | undefined> {
    // upload a single file
    return await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `comm-portal${folderPath}`,
            ...options,
          },
          (error, uploadResult) => {
            if (error)
              return reject(
                new AppError(
                  "Something went wrong while trying to upload your file",
                  500
                )
              )

            return resolve(uploadResult)
          }
        )
        .end(file)
    })
  }

  async uploadFiles(data: UploadOptions[]) {
    // upload multiple files
    const files = await Promise.allSettled(
      data.map(file => this.uploadFile(file))
    )

    const fulfilled = files
      .filter(i => i.status === "fulfilled")
      .map(file => {
        return {
          url: file.value?.secure_url,
          fileName: file.value?.original_filename,
          fileType: file.value?.resource_type,
        }
      })

    const rejected = files.filter(file => file.status === "rejected")

    return { fulfilled, rejected }
  }
}
