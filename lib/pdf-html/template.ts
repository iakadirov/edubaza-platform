import { parseTextWithMath } from '../math-to-png';

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
 * Generate HTML for worksheet with MathJax support
 * This template matches the PDF layout exactly
 */
export async function generateWorksheetHTML(worksheet: Worksheet, userSpecialty?: string): Promise<string> {
  // Process math in all text fields
  const processedTasks = await Promise.all(
    worksheet.tasks.map(async (task) => {
      const questionText = task.content.questionText || task.content.statement || '';
      const questionTextParts = await parseTextWithMath(questionText);

      let optionsParts: any[] | undefined;
      if (task.content.options) {
        optionsParts = await Promise.all(
          task.content.options.map((option) => parseTextWithMath(option))
        );
      }

      return {
        ...task,
        questionTextParts,
        optionsParts,
      };
    })
  );

  // Convert parts to HTML with inline images
  const partsToHTML = (parts: any[]) => {
    return parts
      .map((part) => {
        if (part.type === 'text') {
          return part.content;
        } else if (part.type === 'math' && part.pngDataUrl) {
          const height = part.display ? '14px' : '11px';
          return `<img src="${part.pngDataUrl}" style="height: ${height}; vertical-align: middle; margin: 0 2px;" />`;
        }
        return '';
      })
      .join('');
  };

  const tasksHTML = processedTasks
    .map((task, index) => {
      const taskType = task.content.task_type?.toUpperCase();
      const questionHTML = partsToHTML(task.questionTextParts);

      let taskContentHTML = '';

      switch (taskType) {
        case 'SINGLE_CHOICE':
        case 'MULTIPLE_CHOICE':
          const isSingle = taskType === 'SINGLE_CHOICE';
          const borderRadius = isSingle ? '8px' : '2px';
          const instructionText = isSingle
            ? "Faqat bitta to'g'ri javobni tanlang"
            : "Bir nechta to'g'ri javoblarni belgilang";

          taskContentHTML = `
            <p style="font-size: 4.5px; color: #3677CC; font-weight: 500; margin-top: 3px; margin-bottom: 8px;">
              ${instructionText}
            </p>
            <div style="margin-bottom: 6px;">${questionHTML}</div>
            ${task.content.questionImage ? `<img src="${task.content.questionImage}" style="height: 120px; object-fit: contain; border-radius: 5.75px; margin-bottom: 6px;" />` : ''}
            <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 6px;">
              ${task.content.options
                ?.map((option, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const optionHTML = task.optionsParts?.[optIdx]
                    ? partsToHTML(task.optionsParts[optIdx])
                    : option;
                  return `
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <div style="width: 8px; height: 8px; border: 1px solid #000; border-radius: ${borderRadius}; background: #fff;"></div>
                      <span style="font-size: 5px; line-height: 1.3; color: #000;">${letter}. ${optionHTML}</span>
                    </div>
                  `;
                })
                .join('')}
            </div>
          `;
          break;

        case 'TRUE_FALSE':
          taskContentHTML = `
            <p style="font-size: 4.5px; color: #3677CC; font-weight: 500; margin-top: 3px; margin-bottom: 8px;">
              To'g'ri yoki noto'g'rini tanlang
            </p>
            <div style="margin-bottom: 6px;">${questionHTML}</div>
            <div style="display: flex; gap: 23px; margin-top: 6px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <div style="width: 8px; height: 8px; border: 1px solid #000; border-radius: 2px; background: #fff;"></div>
                <span style="font-size: 5px;">✓ To'g'ri</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <div style="width: 8px; height: 8px; border: 1px solid #000; border-radius: 2px; background: #fff;"></div>
                <span style="font-size: 5px;">✗ Noto'g'ri</span>
              </div>
            </div>
          `;
          break;

        case 'SHORT_ANSWER':
          taskContentHTML = `
            <p style="font-size: 4.5px; color: #3677CC; font-weight: 500; margin-top: 3px; margin-bottom: 8px;">
              Qisqa javob yozing
            </p>
            <div style="margin-bottom: 6px;">${questionHTML}</div>
            <div style="height: 15px; border-bottom: 0.5px solid #000; margin-top: 6px; margin-bottom: 4px;"></div>
          `;
          break;

        case 'ESSAY':
          taskContentHTML = `
            <p style="font-size: 4.5px; color: #3677CC; font-weight: 500; margin-top: 3px; margin-bottom: 8px;">
              Batafsil javob yozing
            </p>
            <div style="margin-bottom: 6px;">${questionHTML}</div>
            <div style="height: 15px; border-bottom: 0.5px solid #000; margin-top: 6px; margin-bottom: 4px;"></div>
            <div style="height: 15px; border-bottom: 0.5px solid #000; margin-top: 6px; margin-bottom: 4px;"></div>
            <div style="height: 15px; border-bottom: 0.5px solid #000; margin-top: 6px; margin-bottom: 4px;"></div>
          `;
          break;

        case 'FILL_BLANKS':
          // Replace [___] with inline underlines in questionHTML
          const questionWithBlanks = questionHTML.replace(/\[___\]/g, '<span style="display: inline-block; width: 60px; height: 15px; border-bottom: 0.5px solid #000; margin: 0 2px;"></span>');
          taskContentHTML = `
            <p style="font-size: 4.5px; color: #3677CC; font-weight: 500; margin-top: 3px; margin-bottom: 8px;">
              Bo'sh joylarni to'ldiring
            </p>
            <div style="margin-bottom: 6px;">${questionWithBlanks}</div>
          `;
          break;

        default:
          taskContentHTML = `<div>${questionHTML}</div>`;
      }

      return `
        <div style="width: 100%; padding: 10px 10px 2px; border: 0.5px solid #E2E2E2; border-radius: 6px; margin-bottom: 8px; background: transparent; page-break-inside: avoid;">
          <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
            <div style="width: 15px; height: 15px; background: #BEDAFF; border-radius: 50%; color: #00275B; font-size: 8px; font-weight: 700; text-align: center; line-height: 15px; flex-shrink: 0;">
              ${index + 1}
            </div>
            <div style="flex: 1; margin-left: 8px;">
              ${taskContentHTML}
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${worksheet.title}</title>
  <style>
    @page {
      size: A4;
      margin: 25px 15px;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #fff;
      color: #000;
      font-size: 5px;
      line-height: 1.3;
    }

    .header {
      width: 100%;
      padding: 12px 10px;
      border: 0.5px solid #E9E9E9;
      border-radius: 6px;
      margin-bottom: 10px;
    }

    .header-title {
      font-size: 7px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 8px;
    }

    .student-info {
      display: flex;
      align-items: center;
    }

    .student-info-label {
      font-size: 5px;
      font-weight: 600;
      margin-right: 6px;
    }

    .student-info-value {
      border-bottom: 0.5px solid #000;
      width: 180px;
      height: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">${worksheet.title}</div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="student-info">
        <span class="student-info-label">F.I.SH:</span>
        <div class="student-info-value"></div>
      </div>
      <div class="student-info">
        <span class="student-info-label">Sinf:</span>
        <div class="student-info-value" style="width: 50px;"></div>
      </div>
      <div class="student-info">
        <span class="student-info-label">Sana:</span>
        <div class="student-info-value" style="width: 100px;"></div>
      </div>
    </div>
  </div>

  ${tasksHTML}

  <div style="margin-top: 20px; text-align: center; font-size: 4px; color: #666;">
    Edubaza.uz orqali yaratilgan
  </div>
</body>
</html>
  `;
}
