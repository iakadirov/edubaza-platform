import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer, Font } from '@react-pdf/renderer';
import { WorksheetPDF } from '@/lib/pdf/templates/WorksheetPDF';
import { verifyToken } from '@/lib/jwt';
import { findUserByPhone } from '@/lib/db-users';
import path from 'path';

let fontsRegistered = false;

function registerFonts() {
  if (fontsRegistered) return;

  const fontsDir = path.join(process.cwd(), 'public', 'fonts');

  Font.register({
    family: 'Onest',
    fonts: [
      {
        src: path.join(fontsDir, 'Onest-Regular.ttf'),
        fontWeight: 400,
      },
      {
        src: path.join(fontsDir, 'Onest-SemiBold.ttf'),
        fontWeight: 600,
      },
      {
        src: path.join(fontsDir, 'Onest-Bold.ttf'),
        fontWeight: 700,
      },
    ],
  });

  fontsRegistered = true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Register fonts before generating PDF
    registerFonts();

    // Проверяем токен
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Токен авторизации не найден' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Недействительный или истёкший токен' },
        { status: 401 }
      );
    }

    // Получаем пользователя
    const user = await findUserByPhone(payload.phone);

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const worksheetId = params.id;

    // Получаем worksheet через docker exec
    const { spawn } = require('child_process');

    const worksheet = await new Promise<any>((resolve, reject) => {
      const sql = `SELECT id, "userId", subject, grade, "topicUz", "topicRu", config, tasks, status, "generatedAt", "viewCount"
                   FROM worksheets
                   WHERE id = '${worksheetId}' AND "userId" = '${user.id}'
                   LIMIT 1;`;

      const proc = spawn('docker', ['exec', '-i', 'edubaza_postgres', 'psql', '-U', 'edubaza', '-d', 'edubaza', '-t', '-A', '-F', '|']);

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`SQL execution failed: ${stderr}`));
        } else {
          const line = stdout.trim();
          if (!line) {
            resolve(null);
            return;
          }

          const parts = line.split('|');
          resolve({
            id: parts[0],
            userId: parts[1],
            subject: parts[2],
            grade: parseInt(parts[3]),
            topicUz: parts[4],
            topicRu: parts[5],
            config: JSON.parse(parts[6]),
            tasks: JSON.parse(parts[7]),
            status: parts[8],
            generatedAt: parts[9],
            viewCount: parseInt(parts[10] || '0'),
          });
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });

      proc.stdin.write(sql);
      proc.stdin.end();
    });

    if (!worksheet) {
      return NextResponse.json(
        { error: 'Worksheet не найден' },
        { status: 404 }
      );
    }

    // Подготавливаем данные для PDF
    const pdfData = {
      title: worksheet.topicUz || 'Ish varaqasi',
      subject: worksheet.subject,
      grade: worksheet.grade,
      quarter: worksheet.config?.quarter,
      week: worksheet.config?.week,
      tasks: worksheet.tasks || [],
    };

    // Генерируем PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(WorksheetPDF, { data: pdfData })
    );

    // Формируем имя файла
    const fileName = `worksheet_${worksheetId}_${Date.now()}.pdf`;

    // Возвращаем PDF файл
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
