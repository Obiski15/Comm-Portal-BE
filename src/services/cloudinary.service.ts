import config from "@/config"
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary"

// import sharp from "sharp"

import AppError from "@/utils/AppError"

interface UploadOptions extends UploadApiOptions {
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

  // async resizeImage(buffer: Buffer) {
  //   return await sharp(buffer)
  //     .resize(196, 196, {
  //       fit: "cover", // Ensures the image fills 196x196
  //       withoutEnlargement: true, // Prevents upscaling smaller images
  //     })
  //     .png({
  //       compressionLevel: 9, // 0 (fastest, largest) to 9 (slowest, smallest)
  //       quality: 100, // for image quality tuning
  //       adaptiveFiltering: true,
  //       force: true,
  //     })
  //     .toBuffer()
  // }

  async uploadImage({
    file,
    folderPath = "/",
    ...options
  }: UploadOptions): Promise<UploadApiResponse | undefined> {
    // upload a single image
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
                  "Something went wrong while trying to upload your image",
                  500
                )
              )

            return resolve(uploadResult)
          }
        )
        .end(file)
    })
  }

  async uploadImages(files: UploadOptions[]) {
    // upload multiple images
    const images = await Promise.allSettled(
      files.map(file => this.uploadImage(file))
    )

    const fulfilled = images
      .filter(i => i.status === "fulfilled")
      .map(image => {
        return {
          url: image.value?.secure_url,
          fileName: image.value?.original_filename,
        }
      })

    const rejected = images.filter(image => image.status === "rejected")

    return { fulfilled, rejected }
  }
}
