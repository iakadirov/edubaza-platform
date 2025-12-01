import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer, Font } from '@react-pdf/renderer';
import { WorksheetPDF } from '@/lib/pdf/templates/WorksheetPDF';
import { verifyToken } from '@/lib/jwt';
import { findUserByPhone } from '@/lib/db-users';
import { parseTextWithMath } from '@/lib/math-to-png';
import { generateWorksheetTitle, generatePdfFileName } from '@/lib/worksheet-title';
import { generatePDFWithPuppeteer } from '@/lib/pdf-html';
import { executeSql } from '@/lib/db-helper';
import path from 'path';

// Subjects that require high-quality math rendering (use Puppeteer)
const HIGH_QUALITY_MATH_SUBJECTS = ['MATHEMATICS', 'PHYSICS', 'CHEMISTRY'];

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

    // Получаем worksheet
    // Админы могут скачивать PDF всех worksheets, обычные пользователи - только свои
    const userCondition = (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')
      ? ''
      : `AND "userId" = '${user.id}'`;

    const sql = `SELECT id, "userId", subject, grade, "topicUz", "topicRu", config, tasks, status, "generatedAt", "viewCount"
                 FROM worksheets
                 WHERE id = '${worksheetId}' ${userCondition}
                 LIMIT 1;`;

    const stdout = await executeSql(sql, { fieldSeparator: '|' });
    const line = stdout.trim();

    let worksheet = null;
    if (line) {
      const parts = line.split('|');
      worksheet = {
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
      };
    }

    if (!worksheet) {
      return NextResponse.json(
        { error: 'Worksheet не найден' },
        { status: 404 }
      );
    }

    // Pre-process all tasks to convert LaTeX to SVG
    const processedTasks = await Promise.all(
      (worksheet.tasks || []).map(async (task: any) => {
        const content = task.content || {};
        const processedContent = { ...content };

        // Process questionText if it exists
        if (content.questionText) {
          const parts = await parseTextWithMath(content.questionText);
          processedContent.questionTextParts = parts;
        }

        // Process statement if it exists
        if (content.statement) {
          const parts = await parseTextWithMath(content.statement);
          processedContent.statementParts = parts;
        }

        // Process textWithBlanks if it exists
        if (content.textWithBlanks) {
          const parts = await parseTextWithMath(content.textWithBlanks);
          processedContent.textWithBlanksParts = parts;
        }

        // Process options array if it exists (for multiple choice, single choice tasks)
        if (content.options && Array.isArray(content.options)) {
          console.log('=== Processing options ===');
          console.log('Options:', content.options);
          processedContent.optionsParts = await Promise.all(
            content.options.map(async (option: string, idx: number) => {
              console.log(`Processing option ${idx}:`, option);
              const parts = await parseTextWithMath(option);
              console.log(`Option ${idx} parts:`, parts);
              return parts;
            })
          );
          console.log('=== Options processed ===');
        }

        // Process answer if it exists (for short answer tasks)
        if (content.answer && typeof content.answer === 'string') {
          const parts = await parseTextWithMath(content.answer);
          processedContent.answerParts = parts;
        }

        // Process correctAnswer if it's a string (some task types have string answers)
        if (content.correctAnswer && typeof content.correctAnswer === 'string') {
          const parts = await parseTextWithMath(content.correctAnswer);
          processedContent.correctAnswerParts = parts;
        }

        // Process explanation if it exists
        if (content.explanation && typeof content.explanation === 'string') {
          const parts = await parseTextWithMath(content.explanation);
          processedContent.explanationParts = parts;
        }

        // Process matching pairs if they exist
        if (content.pairs && Array.isArray(content.pairs)) {
          processedContent.pairsParts = await Promise.all(
            content.pairs.map(async (pair: any) => {
              return {
                left: await parseTextWithMath(pair.left),
                right: await parseTextWithMath(pair.right),
              };
            })
          );
        }

        return {
          ...task,
          content: processedContent,
        };
      })
    );

    // Генерируем название на узбекском
    const title = generateWorksheetTitle(
      worksheet.topicUz,
      worksheet.subject,
      worksheet.grade,
      worksheet.config?.quarter,
      worksheet.config?.week
    );

    // Determine if watermark should be shown based on subscription plan from database
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role || 'USER');

    // Fetch subscription plan settings from database
    let showWatermark = true; // default: show watermark

    if (!isAdmin && user.subscriptionPlan) {
      const planSql = `SELECT show_watermark FROM subscription_plans WHERE plan_code = '${user.subscriptionPlan}' AND is_active = TRUE LIMIT 1`;
      const planResult = await executeSql(planSql);

      if (planResult && planResult.trim() !== '') {
        showWatermark = planResult.trim() === 't'; // PostgreSQL boolean true = 't'
      }
    }

    // Admins never see watermarks
    if (isAdmin) {
      showWatermark = false;
    }

    // Подготавливаем данные для PDF
    const pdfData = {
      title,
      subject: worksheet.subject,
      grade: worksheet.grade,
      quarter: worksheet.config?.quarter,
      week: worksheet.config?.week,
      tasks: processedTasks,
      showWatermark,
    };

    // Decide which PDF generation method to use based on subject
    const usePuppeteer = HIGH_QUALITY_MATH_SUBJECTS.includes(worksheet.subject?.toUpperCase() || '');

    console.log('=== PDF Generation Method ===');
    console.log('Subject:', worksheet.subject);
    console.log('Using Puppeteer:', usePuppeteer);
    console.log('===========================');

    let pdfBuffer: Buffer;

    if (usePuppeteer) {
      // Use Puppeteer for high-quality math rendering
      pdfBuffer = await generatePDFWithPuppeteer({
        id: worksheet.id,
        title,
        description: worksheet.description,
        tasks: processedTasks,
        generatedAt: new Date(),
      }, user.specialty || undefined);
    } else {
      // Use react-pdf for other subjects
      pdfBuffer = await renderToBuffer(
        React.createElement(WorksheetPDF, { data: pdfData }) as any
      ) as Buffer;
    }

    // Формируем имя файла на узбекском
    const fileName = generatePdfFileName(
      worksheet.topicUz,
      worksheet.subject,
      worksheet.grade,
      worksheet.config?.quarter,
      worksheet.config?.week
    );

    console.log('=== PDF FILENAME DEBUG ===');
    console.log('topicUz:', worksheet.topicUz);
    console.log('subject:', worksheet.subject);
    console.log('grade:', worksheet.grade);
    console.log('quarter:', worksheet.config?.quarter);
    console.log('week:', worksheet.config?.week);
    console.log('Generated fileName:', fileName);
    console.log('========================');

    // Возвращаем PDF файл с ASCII-safe именем файла
    return new NextResponse(pdfBuffer as any, {
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
