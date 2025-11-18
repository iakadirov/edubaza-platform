// @ts-ignore - MathJax types
import { mathjax } from 'mathjax-full/js/mathjax';
// @ts-ignore
import { TeX } from 'mathjax-full/js/input/tex';
// @ts-ignore
import { SVG } from 'mathjax-full/js/output/svg';
// @ts-ignore
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor';
// @ts-ignore
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';
// @ts-ignore
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages';

// Create adaptor and register it
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

// Create TeX input and SVG output
const tex = new TeX({ packages: AllPackages });
const svg = new SVG({ fontCache: 'none' });

// Create MathJax document
const html = mathjax.document('', { InputJax: tex, OutputJax: svg });

export interface SvgPathData {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  transform?: string;
}

export interface MathSvgData {
  width: number;
  height: number;
  viewBox: string;
  paths: SvgPathData[];
}

/**
 * Convert LaTeX math expression to SVG path data for PDF rendering
 * @param latex - LaTeX expression (without $ delimiters)
 * @param display - Whether to render as display math (true) or inline (false)
 * @returns Promise<SVG data with paths>
 */
export async function latexToSvgData(latex: string, display: boolean = false): Promise<MathSvgData | null> {
  try {
    console.log('=== LaTeX to SVG Data Conversion Start ===');
    console.log('Input LaTeX:', JSON.stringify(latex));
    console.log('Display mode:', display);

    // Convert LaTeX to SVG node
    const node = html.convert(latex, { display });
    console.log('MathJax conversion completed');

    // Get SVG string from the node
    let svgString = adaptor.outerHTML(node);

    // Remove the mjx-container wrapper if present
    svgString = svgString.replace(/<mjx-container[^>]*>/g, '');
    svgString = svgString.replace(/<\/mjx-container>/g, '');

    console.log('Cleaned SVG length:', svgString.length);

    // Extract viewBox
    const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
    if (!viewBoxMatch) {
      console.error('No viewBox found in SVG');
      return null;
    }
    const viewBox = viewBoxMatch[1];
    const [, , vbWidth, vbHeight] = viewBox.split(' ').map(parseFloat);

    // Extract all paths with their attributes
    const pathRegex = /<path[^>]*>/g;
    const paths: SvgPathData[] = [];
    let match;

    while ((match = pathRegex.exec(svgString)) !== null) {
      const pathTag = match[0];

      const dMatch = pathTag.match(/d="([^"]*)"/);
      if (!dMatch) continue;

      const pathData: SvgPathData = {
        d: dMatch[1],
      };

      // Extract optional attributes
      const fillMatch = pathTag.match(/fill="([^"]*)"/);
      if (fillMatch && fillMatch[1] !== 'none') {
        pathData.fill = fillMatch[1];
      }

      const strokeMatch = pathTag.match(/stroke="([^"]*)"/);
      if (strokeMatch && strokeMatch[1] !== 'none') {
        pathData.stroke = strokeMatch[1];
      }

      const strokeWidthMatch = pathTag.match(/stroke-width="([^"]*)"/);
      if (strokeWidthMatch) {
        pathData.strokeWidth = parseFloat(strokeWidthMatch[1]);
      }

      const transformMatch = pathTag.match(/transform="([^"]*)"/);
      if (transformMatch) {
        pathData.transform = transformMatch[1];
      }

      paths.push(pathData);
    }

    console.log(`Extracted ${paths.length} paths from SVG`);
    console.log('ViewBox:', viewBox);
    console.log('Dimensions:', vbWidth, 'x', vbHeight);
    console.log('=== LaTeX Conversion Success ===\n');

    return {
      width: vbWidth,
      height: vbHeight,
      viewBox,
      paths,
    };
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
  svgData?: MathSvgData | null;
}>> {
  console.log('\n=== parseTextWithMath Start ===');
  console.log('Input text:', JSON.stringify(text));

  const parts: Array<{
    type: 'text' | 'math';
    content: string;
    display?: boolean;
    svgData?: MathSvgData | null;
  }> = [];

  let current = 0;
  const mathRegex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  let match;
  let mathCount = 0;

  while ((match = mathRegex.exec(text)) !== null) {
    mathCount++;
    console.log(`\nFound math #${mathCount}:`);
    console.log('  Full match:', JSON.stringify(match[0]));

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
      const svgData = await latexToSvgData(match[1], true);
      parts.push({
        type: 'math',
        content: match[1],
        display: true,
        svgData,
      });
    } else if (match[2] !== undefined) {
      // Inline math ($...$)
      console.log('  Converting as INLINE math...');
      const svgData = await latexToSvgData(match[2], false);
      parts.push({
        type: 'math',
        content: match[2],
        display: false,
        svgData,
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
