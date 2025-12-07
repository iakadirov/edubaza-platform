/**
 * Storage helpers for Library Module
 * Built on top of the universal storage interface (lib/storage.ts)
 */

import { uploadFile, deleteFile, generateFileKey, getSignedFileUrl } from './storage';

// ============================================
// Book PDF Functions
// ============================================

/**
 * Upload book PDF file
 * @param file - File object or Buffer
 * @param bookId - Book UUID
 * @param originalFilename - Original filename
 * @returns Object with URL, filename, and size
 */
export async function uploadBookPDF(
  file: File | Buffer,
  bookId: string,
  originalFilename: string
): Promise<{
  url: string;
  filename: string;
  sizeBytes: number;
}> {
  // Convert File to Buffer if needed
  const buffer = file instanceof Buffer ? file : Buffer.from(await file.arrayBuffer());

  // Generate unique key for the PDF
  const key = `library/books/${bookId}/${generateFileKey(originalFilename, 'pdfs')}`;

  // Upload to storage
  const url = await uploadFile(buffer, key, 'application/pdf');

  return {
    url,
    filename: originalFilename,
    sizeBytes: buffer.length,
  };
}

/**
 * Upload book cover image
 * @param file - File object or Buffer
 * @param bookId - Book UUID
 * @param originalFilename - Original filename
 * @returns URL of uploaded cover image
 */
export async function uploadBookCover(
  file: File | Buffer,
  bookId: string,
  originalFilename: string
): Promise<string> {
  // Convert File to Buffer if needed
  const buffer = file instanceof Buffer ? file : Buffer.from(await file.arrayBuffer());

  // Determine content type
  const ext = originalFilename.split('.').pop()?.toLowerCase();
  const contentType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/webp';

  // Generate unique key for the cover
  const key = `library/covers/${bookId}/${generateFileKey(originalFilename, 'covers')}`;

  // Upload to storage
  return await uploadFile(buffer, key, contentType);
}

/**
 * Delete book PDF file
 * @param pdfUrl - Full URL of the PDF
 */
export async function deleteBookPDF(pdfUrl: string): Promise<void> {
  const key = extractKeyFromUrl(pdfUrl);
  if (key) {
    await deleteFile(key);
  }
}

/**
 * Delete book cover image
 * @param coverUrl - Full URL of the cover
 */
export async function deleteBookCover(coverUrl: string): Promise<void> {
  const key = extractKeyFromUrl(coverUrl);
  if (key) {
    await deleteFile(key);
  }
}

/**
 * Get signed download URL for book PDF
 * @param pdfUrl - Full URL of the PDF
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getBookDownloadUrl(pdfUrl: string, expiresIn: number = 3600): Promise<string> {
  const key = extractKeyFromUrl(pdfUrl);
  if (!key) {
    return pdfUrl; // Return original URL if can't extract key
  }

  return await getSignedFileUrl(key, expiresIn);
}

// ============================================
// Helper Functions
// ============================================

/**
 * Extract storage key from full URL
 * Supports both Yandex Cloud URLs and local URLs
 * @param url - Full URL
 * @returns Storage key or null
 */
function extractKeyFromUrl(url: string): string | null {
  try {
    // For Yandex Cloud URLs: https://storage.yandexcloud.net/bucket-name/path/to/file.pdf
    if (url.includes('storage.yandexcloud.net')) {
      const parts = url.split('/');
      const bucketIndex = parts.findIndex((p) => p === 'storage.yandexcloud.net');
      if (bucketIndex !== -1 && bucketIndex + 2 < parts.length) {
        // Skip bucket name and get the rest
        return parts.slice(bucketIndex + 2).join('/');
      }
    }

    // For local URLs: /uploads/path/to/file.pdf
    if (url.startsWith('/uploads/')) {
      return url.replace('/uploads/', '');
    }

    return null;
  } catch (error) {
    console.error('Error extracting key from URL:', error);
    return null;
  }
}

/**
 * Validate PDF file
 * @param file - File object
 * @param maxSizeMB - Maximum file size in MB (default: 100MB)
 * @returns Validation result
 */
export function validatePDFFile(
  file: File,
  maxSizeMB: number = 100
): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Файл должен быть в формате PDF' };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Размер файла не должен превышать ${maxSizeMB}MB` };
  }

  return { valid: true };
}

/**
 * Validate cover image file
 * @param file - File object
 * @param maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns Validation result
 */
export function validateCoverImage(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Файл должен быть изображением (JPEG, PNG, WebP)' };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Размер файла не должен превышать ${maxSizeMB}MB` };
  }

  return { valid: true };
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Generate book slug from title
 * @param title - Book title
 * @param bookId - Book UUID (for uniqueness)
 * @returns URL-safe slug
 */
export function generateBookSlug(title: string, bookId: string): string {
  // Transliterate Cyrillic to Latin
  const translitMap: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
    // Uzbek specific
    ў: 'o',
    қ: 'q',
    ғ: 'g',
    ҳ: 'h',
  };

  let slug = title
    .toLowerCase()
    .split('')
    .map((char) => translitMap[char] || char)
    .join('');

  // Remove special characters and replace spaces with hyphens
  slug = slug
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  // Add short book ID for uniqueness
  const shortId = bookId.substring(0, 8);
  return `${slug}-${shortId}`;
}
