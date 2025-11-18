'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  text: string;
  className?: string;
  block?: boolean;
}

/**
 * Component to render text with inline and display math formulas
 * Supports both inline math ($...$) and display math ($$...$$)
 */
export function MathText({ text, className = '', block = false }: MathTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;

    const container = containerRef.current;
    container.innerHTML = '';

    // Parse text and render math
    const parts = parseTextWithMath(text);

    parts.forEach(part => {
      if (part.type === 'text') {
        const textNode = document.createTextNode(part.content);
        container.appendChild(textNode);
      } else if (part.type === 'math') {
        const span = document.createElement('span');
        try {
          katex.render(part.content, span, {
            displayMode: part.display,
            throwOnError: false,
            trust: true,
          });
          // Увеличиваем размер формулы на 1.2x
          span.style.fontSize = '1.2em';
        } catch (e) {
          console.error('KaTeX rendering error:', e);
          span.textContent = part.content;
        }
        container.appendChild(span);
      }
    });
  }, [text]);

  return block ? (
    <div ref={containerRef} className={className} />
  ) : (
    <span ref={containerRef} className={className} />
  );
}

interface ParsedPart {
  type: 'text' | 'math';
  content: string;
  display?: boolean;
}

function parseTextWithMath(text: string): ParsedPart[] {
  const parts: ParsedPart[] = [];
  let current = 0;

  // Regex to match $$...$$ (display) and $...$ (inline)
  const mathRegex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  let match;

  while ((match = mathRegex.exec(text)) !== null) {
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
      parts.push({
        type: 'math',
        content: match[1],
        display: true,
      });
    } else if (match[2] !== undefined) {
      // Inline math ($...$)
      parts.push({
        type: 'math',
        content: match[2],
        display: false,
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

  return parts;
}
