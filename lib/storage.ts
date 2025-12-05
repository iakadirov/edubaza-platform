/**
 * Universal Storage Interface for Edubaza Platform
 *
 * Supports:
 * - Local file system (development)
 * - Yandex Cloud Object Storage (production)
 * - Easy switching via environment variables
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs/promises';
import path from 'path';

// Storage type configuration
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local'; // 'local' or 'cloud'

// Yandex Cloud configuration
const s3Client = new S3Client({
  region: 'ru-central1',
  endpoint: 'https://storage.yandexcloud.net',
  credentials: {
    accessKeyId: process.env.YC_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.YC_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.YC_BUCKET_NAME || 'edubaza-files';
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * Upload file to storage
 * @param buffer - File buffer
 * @param key - File path/key (e.g., 'worksheets/2024/file.pdf')
 * @param contentType - MIME type (e.g., 'application/pdf')
 * @returns Public URL of the uploaded file
 */
export async function uploadFile(
  buffer: Buffer,
  key: string,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  if (STORAGE_TYPE === 'cloud') {
    // Upload to Yandex Cloud
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    return `https://storage.yandexcloud.net/${BUCKET_NAME}/${key}`;
  } else {
    // Save to local file system
    const localPath = path.join(LOCAL_UPLOAD_DIR, key);
    const dir = path.dirname(localPath);

    // Create directories if they don't exist
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(localPath, buffer);

    return `/uploads/${key}`;
  }
}

/**
 * Get signed URL for temporary access to private files
 * @param key - File path/key
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getSignedFileUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  if (STORAGE_TYPE === 'cloud') {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } else {
    // For local storage, just return the public URL
    // In production, you might want to implement token-based access
    return `/uploads/${key}`;
  }
}

/**
 * Delete file from storage
 * @param key - File path/key
 */
export async function deleteFile(key: string): Promise<void> {
  if (STORAGE_TYPE === 'cloud') {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
  } else {
    const localPath = path.join(LOCAL_UPLOAD_DIR, key);
    try {
      await fs.unlink(localPath);
    } catch (error) {
      // File might not exist, ignore error
      console.warn(`Failed to delete file: ${localPath}`, error);
    }
  }
}

/**
 * Generate unique file key with timestamp and random string
 * @param originalName - Original file name
 * @param folder - Folder path (e.g., 'worksheets', 'avatars')
 * @returns Unique file key
 */
export function generateFileKey(originalName: string, folder: string = 'files'): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  const basename = path.basename(originalName, extension);
  const sanitizedBasename = basename.replace(/[^a-zA-Z0-9]/g, '_');

  return `${folder}/${timestamp}_${randomString}_${sanitizedBasename}${extension}`;
}

/**
 * Get file type category based on MIME type
 */
export function getFileCategory(contentType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('video/')) return 'video';
  if (contentType.startsWith('audio/')) return 'audio';
  if (
    contentType.includes('pdf') ||
    contentType.includes('document') ||
    contentType.includes('word') ||
    contentType.includes('excel') ||
    contentType.includes('powerpoint')
  ) {
    return 'document';
  }
  return 'other';
}
