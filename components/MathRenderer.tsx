'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  text: string;
  className?: string;
}

export default function MathRenderer({ text, className = '' }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;

    // Replace LaTeX formulas with rendered versions
    let processedText = text;

    // Process display math ($$...$$)
    processedText = processedText.replace(/\$\$(.*?)\$\$/gs, (match, formula) => {
      try {
        return katex.renderToString(formula, {
          displayMode: true,
          throwOnError: false,
        });
      } catch (e) {
        return match;
      }
    });

    // Process inline math ($...$)
    processedText = processedText.replace(/\$([^\$]+?)\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula, {
          displayMode: false,
          throwOnError: false,
        });
      } catch (e) {
        return match;
      }
    });

    containerRef.current.innerHTML = processedText;
  }, [text]);

  return <div ref={containerRef} className={className} />;
}
