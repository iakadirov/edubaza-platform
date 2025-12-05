import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { uploadFile, generateFileKey, deleteFile } from '@/lib/storage';

/**
 * Universal File Upload API
 * Supports both local storage and Yandex Cloud (configured via STORAGE_TYPE env var)
 */
export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Недействительный токен' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = (formData.get('type') as string) || 'general'; // 'logo', 'banner', 'worksheet', etc.

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Файл не предоставлен' },
        { status: 400 }
      );
    }

    // Проверка типа файла (расширенный список)
    const allowedTypes = [
      // Images
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Video
      'video/mp4',
      'video/webm',
      // Audio
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: `Тип файла не поддерживается: ${file.type}` },
        { status: 400 }
      );
    }

    // Проверка размера файла (50MB макс для всех, 5MB для изображений)
    const isImage = file.type.startsWith('image/');
    const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024;

    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        { success: false, message: `Файл слишком большой. Максимум ${maxMB}MB` },
        { status: 400 }
      );
    }

    // Конвертация файла в Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Генерация уникального ключа
    const folder = type === 'logo' || type === 'banner' ? 'subjects' : type;
    const fileKey = generateFileKey(file.name, folder);

    // Загрузка файла (local или cloud - автоматически)
    const fileUrl = await uploadFile(buffer, fileKey, file.type);

    return NextResponse.json({
      success: true,
      message: 'Файл успешно загружен',
      data: {
        url: fileUrl,
        key: fileKey,
        fileName: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при загрузке файла',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE - удаление файла (universal: local + cloud)
export async function DELETE(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Недействительный токен' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get('key'); // e.g., 'worksheets/123_abc_file.pdf'

    if (!fileKey) {
      return NextResponse.json(
        { success: false, message: 'Не указан ключ файла' },
        { status: 400 }
      );
    }

    // Удаление файла (автоматически выбирается local или cloud)
    await deleteFile(fileKey);

    return NextResponse.json({
      success: true,
      message: 'Файл успешно удалён',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при удалении файла',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
