import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { verifyToken } from '@/lib/jwt';

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
    const type = formData.get('type') as string; // 'logo' or 'banner'

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Файл не предоставлен' },
        { status: 400 }
      );
    }

    // Проверка типа файла
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Разрешены только PNG, JPG и SVG файлы' },
        { status: 400 }
      );
    }

    // Проверка размера файла (5MB макс)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'Файл слишком большой. Максимум 5MB' },
        { status: 400 }
      );
    }

    // Генерация уникального имени файла
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const fileName = `${type}-${timestamp}-${randomStr}.${extension}`;

    // Конвертация файла в Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Путь для сохранения
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'subjects');
    const filePath = join(uploadDir, fileName);

    // Сохранение файла
    await writeFile(filePath, buffer);

    // URL для доступа к файлу
    const fileUrl = `/uploads/subjects/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'Файл успешно загружен',
      data: {
        url: fileUrl,
        fileName: fileName,
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

// DELETE - удаление файла
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
    const fileUrl = searchParams.get('url');

    if (!fileUrl || !fileUrl.startsWith('/uploads/subjects/')) {
      return NextResponse.json(
        { success: false, message: 'Некорректный URL файла' },
        { status: 400 }
      );
    }

    // Удаление файла
    const fs = require('fs').promises;
    const filePath = join(process.cwd(), 'public', fileUrl);

    try {
      await fs.unlink(filePath);
    } catch (err) {
      // Файл может не существовать - это нормально
      console.log('File not found or already deleted:', filePath);
    }

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
