// Subject names in Uzbek (for display)
export const subjectNamesUz: { [key: string]: string } = {
  MATH: 'Matematika',
  PHYSICS: 'Fizika',
  CHEMISTRY: 'Kimyo',
  BIOLOGY: 'Biologiya',
  GEOGRAPHY: 'Geografiya',
  HISTORY: 'Tarix',
  LITERATURE: 'Adabiyot',
  UZBEK_LANGUAGE: 'O\'zbek tili',
  RUSSIAN_LANGUAGE: 'Rus tili',
  ENGLISH_LANGUAGE: 'Ingliz tili',
};

// Subject names in Latin for filenames (ASCII-safe)
export const subjectNamesLatin: { [key: string]: string } = {
  MATH: 'Matematika',
  PHYSICS: 'Fizika',
  CHEMISTRY: 'Kimyo',
  BIOLOGY: 'Biologiya',
  GEOGRAPHY: 'Geografiya',
  HISTORY: 'Tarix',
  LITERATURE: 'Adabiyot',
  UZBEK_LANGUAGE: 'Ozbek_tili',
  RUSSIAN_LANGUAGE: 'Rus_tili',
  ENGLISH_LANGUAGE: 'Ingliz_tili',
};

/**
 * Generate worksheet title in Uzbek format
 * Examples:
 * - With topic: "Arifmetik amallar. 4-sinf, Matematika"
 * - With quarter and week: "4-sinf, Matematika, 1-chorak, 1-hafta"
 * - With quarter only: "4-sinf, Matematika, 2-chorak"
 */
export function generateWorksheetTitle(
  topicUz: string | null | undefined,
  subject: string,
  grade: number,
  quarter?: number,
  week?: number
): string {
  const subjectName = subjectNamesUz[subject] || subject;
  const gradeText = `${grade}-sinf`;

  if (topicUz) {
    // If topic is provided: "Arifmetik amallar. 4-sinf, Matematika"
    return `${topicUz}. ${gradeText}, ${subjectName}`;
  } else if (quarter && week) {
    // With quarter and week: "4-sinf, Matematika, 1-chorak, 1-hafta"
    return `${gradeText}, ${subjectName}, ${quarter}-chorak, ${week}-hafta`;
  } else if (quarter) {
    // With quarter only: "4-sinf, Matematika, 2-chorak"
    return `${gradeText}, ${subjectName}, ${quarter}-chorak`;
  } else {
    // Default: "4-sinf, Matematika"
    return `${gradeText}, ${subjectName}`;
  }
}

/**
 * Generate PDF filename in Uzbek format
 * Examples:
 * - "Arifmetik_amallar_1-chorak_2-hafta_4-sinf_Matematika.pdf"
 * - "1-chorak_2-hafta_4-sinf_Matematika.pdf"
 */
export function generatePdfFileName(
  topicUz: string | null | undefined,
  subject: string,
  grade: number,
  quarter?: number,
  week?: number
): string {
  // Use Latin subject names for filenames (ASCII-safe)
  const subjectName = subjectNamesLatin[subject] || subject;
  const gradeText = `${grade}-sinf`;

  // Build filename parts in order: tema_chorak_hafta_sinf_predmet
  const parts: string[] = [];

  if (topicUz) {
    // Clean topic name for filename: transliterate cyrillic to latin, remove special chars
    const cleanTopic = topicUz
      // Replace common Cyrillic characters with Latin equivalents
      .replace(/[её]/g, 'e')
      .replace(/[ъь]/g, '')
      .replace(/[а]/g, 'a')
      .replace(/[б]/g, 'b')
      .replace(/[в]/g, 'v')
      .replace(/[г]/g, 'g')
      .replace(/[д]/g, 'd')
      .replace(/[ж]/g, 'j')
      .replace(/[з]/g, 'z')
      .replace(/[и]/g, 'i')
      .replace(/[й]/g, 'y')
      .replace(/[к]/g, 'k')
      .replace(/[л]/g, 'l')
      .replace(/[м]/g, 'm')
      .replace(/[н]/g, 'n')
      .replace(/[о]/g, 'o')
      .replace(/[п]/g, 'p')
      .replace(/[р]/g, 'r')
      .replace(/[с]/g, 's')
      .replace(/[т]/g, 't')
      .replace(/[у]/g, 'u')
      .replace(/[ф]/g, 'f')
      .replace(/[х]/g, 'h')
      .replace(/[ц]/g, 'ts')
      .replace(/[ч]/g, 'ch')
      .replace(/[ш]/g, 'sh')
      .replace(/[щ]/g, 'shch')
      .replace(/[ы]/g, 'i')
      .replace(/[э]/g, 'e')
      .replace(/[ю]/g, 'yu')
      .replace(/[я]/g, 'ya')
      // Remove any remaining non-ASCII characters
      .replace(/[^\x00-\x7F]/g, '')
      // Replace spaces with underscores and remove special chars
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_');

    parts.push(cleanTopic);
  }

  if (quarter) {
    parts.push(`${quarter}-chorak`);
  }

  if (week) {
    parts.push(`${week}-hafta`);
  }

  parts.push(gradeText);
  parts.push(subjectName);

  return parts.join('_') + '.pdf';
}
