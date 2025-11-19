import puppeteer from 'puppeteer';
import { generateWorksheetHTML } from './template';

interface Task {
  id: string;
  content: {
    task_type?: string;
    questionText?: string;
    statement?: string;
    questionImage?: string;
    options?: string[];
    correctAnswer?: number | boolean | string;
    answer?: string;
    explanation?: string;
    pairs?: Array<{ left: string; right: string }>;
    blanks?: Array<{ correctAnswer: string; acceptableAnswers: string[] }>;
    textWithBlanks?: string;
  };
}

interface Worksheet {
  id: string;
  title: string;
  description: string | null;
  tasks: Task[];
  generatedAt: Date;
}

/**
 * Generate PDF from worksheet using Puppeteer (HTML → PDF)
 * This provides perfect quality for mathematical formulas
 */
export async function generatePDFWithPuppeteer(worksheet: Worksheet, userSpecialty?: string): Promise<Buffer> {
  console.log('=== Generating PDF with Puppeteer ===');
  console.log('Worksheet:', worksheet.id);
  console.log('Specialty:', userSpecialty);

  let browser;
  try {
    // Generate HTML
    const html = await generateWorksheetHTML(worksheet, userSpecialty);

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '25px',
        bottom: '25px',
        left: '15px',
        right: '15px',
      },
    });

    console.log('=== PDF Generated Successfully ===');
    console.log('Buffer size:', pdfBuffer.length);

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('=== PDF Generation FAILED ===');
    console.error('Error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
