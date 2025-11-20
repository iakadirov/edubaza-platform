import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import { commonStyles } from '../styles/common';
import { MathText } from './MathText';
import { normalizeUzbText } from '../utils/text-normalize';

interface TaskContent {
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
}

// 1. SINGLE_CHOICE - Тест с одним правильным ответом
export const SingleChoiceTask: React.FC<{ content: TaskContent }> = ({ content }) => {
  const questionText = content.questionText || content.statement || '';
  const questionTextParts = (content as any).questionTextParts || (content as any).statementParts;
  const optionsParts = (content as any).optionsParts;

  return (
    <View>
      <Text style={{ fontSize: 9, color: '#3677CC', fontWeight: 500, marginTop: 3, marginBottom: 8 }}>
        Faqat bitta to'g'ri javobni tanlang
      </Text>
      <MathText parts={questionTextParts} text={questionText} style={commonStyles.questionText} />

      {content.questionImage && (
        <Image src={content.questionImage} style={commonStyles.questionImage} />
      )}

      <View style={commonStyles.optionsContainer}>
        {content.options?.map((option, index) => (
          <View key={index} style={commonStyles.optionItem}>
            <View style={[commonStyles.checkbox, { borderRadius: 8 }]} />
            {optionsParts && optionsParts[index] ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                <Text style={commonStyles.optionText}>{String.fromCharCode(65 + index)}. </Text>
                <MathText parts={optionsParts[index]} text={option} style={commonStyles.optionText} />
              </View>
            ) : (
              <Text style={commonStyles.optionText}>
                {String.fromCharCode(65 + index)}. {normalizeUzbText(option)}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

// 2. MULTIPLE_CHOICE - Тест с несколькими правильными ответами
export const MultipleChoiceTask: React.FC<{ content: TaskContent }> = ({ content }) => {
  const questionText = content.questionText || content.statement || '';
  const questionTextParts = (content as any).questionTextParts || (content as any).statementParts;
  const optionsParts = (content as any).optionsParts;

  return (
    <View>
      <Text style={{ fontSize: 9, color: '#3677CC', fontWeight: 500, marginTop: 3, marginBottom: 8 }}>
        Bir nechta to'g'ri javoblarni belgilang
      </Text>
      <MathText parts={questionTextParts} text={questionText} style={commonStyles.questionText} />

      {content.questionImage && (
        <Image src={content.questionImage} style={commonStyles.questionImage} />
      )}

      <View style={commonStyles.optionsContainer}>
        {content.options?.map((option, index) => (
          <View key={index} style={commonStyles.optionItem}>
            <View style={commonStyles.checkbox} />
            {optionsParts && optionsParts[index] ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                <Text style={commonStyles.optionText}>{String.fromCharCode(65 + index)}. </Text>
                <MathText parts={optionsParts[index]} text={option} style={commonStyles.optionText} />
              </View>
            ) : (
              <Text style={commonStyles.optionText}>
                {String.fromCharCode(65 + index)}. {normalizeUzbText(option)}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

// 3. TRUE_FALSE - Верно/Неверно
export const TrueFalseTask: React.FC<{ content: TaskContent }> = ({ content }) => {
  const questionText = content.questionText || content.statement || '';
  const questionTextParts = (content as any).questionTextParts || (content as any).statementParts;

  return (
    <View>
      <Text style={{ fontSize: 9, color: '#3677CC', fontWeight: 500, marginTop: 3, marginBottom: 8 }}>
        To'g'ri yoki noto'g'rini tanlang
      </Text>
      <MathText parts={questionTextParts} text={questionText} style={commonStyles.questionText} />

      {content.questionImage && (
        <Image src={content.questionImage} style={commonStyles.questionImage} />
      )}

      <View style={[commonStyles.optionsContainer, { gap: 23 }]}>
        <View style={commonStyles.optionItem}>
          <View style={commonStyles.checkbox} />
          <Text style={commonStyles.optionText}>{normalizeUzbText("✓ To'g'ri")}</Text>
        </View>
        <View style={commonStyles.optionItem}>
          <View style={commonStyles.checkbox} />
          <Text style={commonStyles.optionText}>{normalizeUzbText("✗ Noto'g'ri")}</Text>
        </View>
      </View>
    </View>
  );
};

// 4. SHORT_ANSWER - Короткий ответ (1 линия)
export const ShortAnswerTask: React.FC<{ content: TaskContent }> = ({ content }) => {
  const questionText = content.questionText || content.statement || '';
  const questionTextParts = (content as any).questionTextParts || (content as any).statementParts;

  return (
    <View>
      <Text style={{ fontSize: 9, color: '#3677CC', fontWeight: 500, marginTop: 3, marginBottom: 8 }}>
        Qisqa javob yozing
      </Text>
      <MathText parts={questionTextParts} text={questionText} style={commonStyles.questionText} />

      {content.questionImage && (
        <Image src={content.questionImage} style={commonStyles.questionImage} />
      )}

      <View style={commonStyles.answerLine} />
    </View>
  );
};

// 5. FILL_BLANKS - Заполнить пропуски
export const FillBlanksTask: React.FC<{ content: TaskContent }> = ({ content }) => {
  const questionText = content.textWithBlanks || content.questionText || content.statement || '';
  const questionTextParts = (content as any).textWithBlanksParts || (content as any).questionTextParts || (content as any).statementParts;

  // Parse text and replace [___] with inline underlines
  const renderTextWithBlanks = () => {
    if (!questionTextParts) {
      // Fallback: parse plain text
      const parts = questionText.split(/(\[___\])/g);
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
          {parts.map((part, index) => {
            if (part === '[___]') {
              return (
                <View
                  key={index}
                  style={{
                    borderBottomWidth: 0.5,
                    borderColor: '#000000',
                    width: 60,
                    height: 15,
                    marginHorizontal: 2,
                  }}
                />
              );
            }
            return <Text key={index} style={commonStyles.questionText}>{normalizeUzbText(part)}</Text>;
          })}
        </View>
      );
    }

    // With math support
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
        {questionTextParts.map((part: any, index: number) => {
          if (part.type === 'text') {
            // Split text by [___] and render
            const textParts = part.content.split(/(\[___\])/g);
            return textParts.map((textPart: string, subIndex: number) => {
              if (textPart === '[___]') {
                return (
                  <View
                    key={`${index}-${subIndex}`}
                    style={{
                      borderBottomWidth: 0.5,
                      borderColor: '#000000',
                      width: 60,
                      height: 15,
                      marginHorizontal: 2,
                    }}
                  />
                );
              }
              return <Text key={`${index}-${subIndex}`} style={commonStyles.questionText}>{normalizeUzbText(textPart)}</Text>;
            });
          } else if (part.type === 'math' && part.pngDataUrl) {
            return (
              <Image
                key={index}
                src={part.pngDataUrl}
                style={{
                  height: part.display ? 14 : 11,
                  marginHorizontal: 2,
                }}
              />
            );
          }
          return null;
        })}
      </View>
    );
  };

  return (
    <View>
      <Text style={{ fontSize: 9, color: '#3677CC', fontWeight: 500, marginTop: 3, marginBottom: 8 }}>
        Bo'sh joylarni to'ldiring
      </Text>
      {renderTextWithBlanks()}
    </View>
  );
};

// 6. MATCHING - Сопоставление
export const MatchingTask: React.FC<{ content: TaskContent }> = ({ content }) => {
  const questionText = content.questionText || content.statement || '';
  const questionTextParts = (content as any).questionTextParts || (content as any).statementParts;
  const pairsParts = (content as any).pairsParts;

  // Перемешиваем правую колонку
  const shuffleRight = (pairs: Array<{ left: string; right: string }>, pairsParts?: any[]) => {
    const rightItems = pairs.map((pair, idx) => ({
      text: pair.right,
      letter: String.fromCharCode(65 + idx),
      parts: pairsParts && pairsParts[idx] ? pairsParts[idx].right : null,
    }));

    // Простое перемешивание (Fisher-Yates)
    for (let i = rightItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rightItems[i], rightItems[j]] = [rightItems[j], rightItems[i]];
    }

    return rightItems;
  };

  const shuffledRight = content.pairs ? shuffleRight(content.pairs, pairsParts) : [];

  return (
    <View>
      <Text style={{ fontSize: 9, color: '#3677CC', fontWeight: 500, marginTop: 3, marginBottom: 8 }}>
        Mos keluvchi javoblarni bog'lang
      </Text>
      <MathText parts={questionTextParts} text={questionText} style={commonStyles.questionText} />

      {content.pairs && content.pairs.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 30, marginTop: 6 }}>
          {/* Левая колонка */}
          <View style={{ flex: 1 }}>
            {content.pairs.map((pair, index) => (
              <View key={index} style={{
                marginBottom: 4,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <View style={{
                  flex: 1,
                  borderWidth: 0.5,
                  borderColor: '#E9E9E9',
                  borderRadius: 3,
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                }}>
                  {pairsParts && pairsParts[index] && pairsParts[index].left ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                      <Text style={commonStyles.optionText}>{index + 1}. </Text>
                      <MathText parts={pairsParts[index].left} text={pair.left} style={commonStyles.optionText} />
                    </View>
                  ) : (
                    <Text style={commonStyles.optionText}>
                      {index + 1}. {normalizeUzbText(pair.left)}
                    </Text>
                  )}
                </View>
                {/* Точка справа */}
                <View style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#666666',
                  marginLeft: 4,
                }} />
              </View>
            ))}
          </View>

          {/* Пространство для линий */}
          <View style={{ width: 22 }} />

          {/* Правая колонка (перемешанная) */}
          <View style={{ flex: 1 }}>
            {shuffledRight.map((item, index) => (
              <View key={index} style={{
                marginBottom: 4,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                {/* Точка слева */}
                <View style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#666666',
                  marginRight: 4,
                }} />
                <View style={{
                  flex: 1,
                  borderWidth: 0.5,
                  borderColor: '#E9E9E9',
                  borderRadius: 3,
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                }}>
                  {item.parts ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                      <Text style={commonStyles.optionText}>{item.letter}. </Text>
                      <MathText parts={item.parts} text={item.text} style={commonStyles.optionText} />
                    </View>
                  ) : (
                    <Text style={commonStyles.optionText}>
                      {item.letter}. {normalizeUzbText(item.text)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// 7. ESSAY - Развернутый ответ (3 линии)
export const EssayTask: React.FC<{ content: TaskContent }> = ({ content }) => {
  const questionText = content.questionText || content.statement || '';
  const questionTextParts = (content as any).questionTextParts || (content as any).statementParts;

  return (
    <View>
      <Text style={{ fontSize: 9, color: '#3677CC', fontWeight: 500, marginTop: 3, marginBottom: 8 }}>
        Batafsil javob yozing
      </Text>
      <MathText parts={questionTextParts} text={questionText} style={commonStyles.questionText} />

      {content.questionImage && (
        <Image src={content.questionImage} style={commonStyles.questionImage} />
      )}

      {/* 3 линии для ответа */}
      <View>
        <View style={commonStyles.answerLine} />
        <View style={commonStyles.answerLine} />
        <View style={commonStyles.answerLine} />
      </View>
    </View>
  );
};
