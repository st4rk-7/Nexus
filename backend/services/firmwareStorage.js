// Stores firmware binaries inside MongoDB GridFS.
// This keeps uploaded files safe when a cloud server restarts.

import mongoose from "mongoose";
import { Readable } from "node:stream";

const BUCKET_NAME = "firmwareFiles";

function getBucket() {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB is not connected");
  }

  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: BUCKET_NAME,
  });
}

function toObjectId(id) {
  return id instanceof mongoose.Types.ObjectId
    ? id
    : new mongoose.Types.ObjectId(id);
}

export function storeFirmwareFile(file) {
  return new Promise((resolve, reject) => {
    const uploadStream = getBucket().openUploadStream(file.originalname, {
      metadata: {
        contentType: file.mimetype,
        size: file.size,
      },
    });

    uploadStream.once("error", reject);
    uploadStream.once("finish", () => {
      resolve({
        fileId: uploadStream.id,
        fileName: file.originalname,
        contentType: file.mimetype || "application/octet-stream",
        fileSize: file.size,
      });
    });

    Readable.from(file.buffer).pipe(uploadStream);
  });
}

export function openFirmwareDownload(fileId) {
  return getBucket().openDownloadStream(toObjectId(fileId));
}

export async function deleteFirmwareFile(fileId) {
  await getBucket().delete(toObjectId(fileId));
}
