import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';

interface MathTextProps {
  parts?: Array<{
    type: 'text' | 'math';
    content: string;
    display?: boolean;
    pngDataUrl?: string | null;
  }>;
  text?: string;
  style?: any;
}

/**
 * Component to render text with math in PDF
 * Renders math formulas as PNG images using puppeteer
 */
export const MathText: React.FC<MathTextProps> = ({ parts, text, style }) => {
  // If no pre-processed parts, just render text
  if (!parts) {
    return <Text style={style}>{text || ''}</Text>;
  }

  // If all parts are text, render as simple text
  if (parts.every(p => p.type === 'text')) {
    return <Text style={style}>{parts.map(p => p.content).join('')}</Text>;
  }

  return (
    <View style={{ marginBottom: 4, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <Text key={index} style={style}>
              {part.content}
            </Text>
          );
        } else if (part.type === 'math') {
          // Render PNG image if available, otherwise fallback to LaTeX text
          if (part.pngDataUrl) {
            return (
              <Image
                key={index}
                src={part.pngDataUrl}
                style={{
                  maxHeight: part.display ? 50 : 24,
                  objectFit: 'contain',
                  marginHorizontal: 2,
                }}
              />
            );
          } else {
            // Fallback to text if PNG generation failed
            return (
              <Text key={index} style={style}>
                ({part.content})
              </Text>
            );
          }
        }
        return null;
      })}
    </View>
  );
};
