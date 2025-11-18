import puppeteer from 'puppeteer';

let browser: any = null;

/**
 * Get or create puppeteer browser instance
 */
async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

/**
 * Convert LaTeX math expression to PNG data URL using puppeteer
 * @param latex - LaTeX expression (without $ delimiters)
 * @param display - Whether to render as display math (true) or inline (false)
 * @returns Promise<PNG data URL string>
 */
export async function latexToPng(latex: string, display: boolean = false): Promise<string | null> {
  try {
    console.log('=== LaTeX to PNG Conversion Start ===');
    console.log('Input LaTeX:', JSON.stringify(latex));
    console.log('Display mode:', display);

    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();

    // Set higher device scale factor for better quality
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 3, // 3x resolution for high quality
    });

    // Create HTML with KaTeX - using larger font sizes for better quality
    const baseFontSize = display ? 32 : 28; // Increased from 18/16
    const html = `
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css">
  <style>
    body {
      margin: 0;
      padding: 30px;
      display: inline-block;
      background: white;
    }
    #math {
      font-size: ${baseFontSize}px;
    }
  </style>
</head>
<body>
  <div id="math"></div>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.js"></script>
  <script>
    window.addEventListener('load', function() {
      katex.render(${JSON.stringify(latex)}, document.getElementById('math'), {
        displayMode: ${display},
        throwOnError: false
      });
    });
  </script>
</body>
</html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for KaTeX to render
    await page.waitForSelector('#math .katex', { timeout: 10000 });
    await page.waitForTimeout(100); // Small delay to ensure rendering is complete

    // Get the rendered element
    const element = await page.$('#math');
    if (!element) {
      console.error('Math element not found');
      await page.close();
      return null;
    }

    // Take screenshot of the element with high quality
    const screenshot = await element.screenshot({
      type: 'png',
      omitBackground: false,
      captureBeyondViewport: false,
    });

    await page.close();

    // Convert buffer to base64 data URL
    const base64 = screenshot.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    console.log('PNG data URL generated, length:', dataUrl.length);
    console.log('=== LaTeX Conversion Success ===\n');

    return dataUrl;
  } catch (error) {
    console.error('=== LaTeX Conversion FAILED ===');
    console.error('Failed LaTeX input:', JSON.stringify(latex));
    console.error('Display mode:', display);
    console.error('Error:', error);
    console.error('=== End Error Details ===\n');
    return null;
  }
}

/**
 * Parse text with math delimiters and extract math expressions
 * @param text - Text with $...$ or $$...$$ delimiters
 * @returns Promise<Array of parts with type and content>
 */
export async function parseTextWithMath(text: string): Promise<Array<{
  type: 'text' | 'math';
  content: string;
  display?: boolean;
  pngDataUrl?: string | null;
}>> {
  console.log('\n=== parseTextWithMath Start ===');
  console.log('Input text:', JSON.stringify(text));

  const parts: Array<{
    type: 'text' | 'math';
    content: string;
    display?: boolean;
    pngDataUrl?: string | null;
  }> = [];

  let current = 0;
  const mathRegex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  let match;
  let mathCount = 0;

  while ((match = mathRegex.exec(text)) !== null) {
    mathCount++;
    console.log(`\nFound math #${mathCount}:`);

    // Add text before math
    if (match.index > current) {
      parts.push({
        type: 'text',
        content: text.substring(current, match.index),
      });
    }

    // Add math
    if (match[1] !== undefined) {
      // Display math ($$...$$)
      console.log('  Converting as DISPLAY math...');
      const pngDataUrl = await latexToPng(match[1], true);
      parts.push({
        type: 'math',
        content: match[1],
        display: true,
        pngDataUrl,
      });
    } else if (match[2] !== undefined) {
      // Inline math ($...$)
      console.log('  Converting as INLINE math...');
      const pngDataUrl = await latexToPng(match[2], false);
      parts.push({
        type: 'math',
        content: match[2],
        display: false,
        pngDataUrl,
      });
    }

    current = match.index + match[0].length;
  }

  // Add remaining text
  if (current < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(current),
    });
  }

  console.log(`\nTotal parts found: ${parts.length} (${mathCount} math, ${parts.length - mathCount} text)`);
  console.log('=== parseTextWithMath End ===\n');

  return parts;
}
