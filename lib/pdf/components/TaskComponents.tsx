import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import { commonStyles } from '../styles/common';

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

  return (
    <View>
      <Text style={{ fontSize: 8, color: '#666666', marginBottom: 4 }}>
        Faqat bitta to‘g‘ri javobni tanlang
      </Text>
      <Text style={commonStyles.questionText}>{questionText}</Text>

      {content.questionImage && (
        <Image src={content.questionImage} style={commonStyles.questionImage} />
      )}

      <View style={commonStyles.optionsContainer}>
        {content.options?.map((option, index) => (
          <View key={index} style={commonStyles.optionItem}>
            <View style={[commonStyles.checkbox, { borderRadius: 8 }]} />
            <Text style={commonStyles.optionText}>
              {String.fromCharCode(65 + index)}. {option}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// 2. MULTIPLE_CHOICE - Тест с несколькими правильными ответами
export const MultipleChoiceTask: React.FC<{ content: TaskContent }> = ({ content }) => {
  const questionText = content.questionText || content.statement || '';

  return (
    <View>
      <Text style={{ fontSize: 8, color: '#666666', marginBottom: 4 }}>
        Bir nechta to‘g‘ri javoblarni belgilang
      </Text>
      <Text style={commonStyles.questionText}>{questionText}</Text>

      {content.questionImage && (
        <Image src={content.questionImage} style={commonStyles.questionImage} />
      )}

      <View style={commonStyles.optionsContainer}>
        {content.options?.map((option, index) => (
          <View key={index} style={commonStyles.optionItem}>
            <View style={commonStyles.checkbox} />
            <Text style={commonStyles.optionText}>
              {String.fromCharCode(65 + index)}. {option}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// 3. TRUE_FALSE - Верно/Неверно
export const TrueFalseTask: React.FC<{ content: TaskContent }> = ({ content }) => {
  const questionText = content.questionText || content.statement || '';

  return (
    <View>
      <Text style={{ fontSize: 8, color: '#666666', marginBottom: 4 }}>
        To'g'ri yoki noto‘g‘rini tanlang
      </Text>
      <Text style={commonStyles.questionText}>{questionText}</Text>

      {content.questionImage && (
        <Image src={content.questionImage} style={commonStyles.questionImage} />
      )}

      <View style={[commonStyles.optionsContainer, { gap: 23 }]}>
        <View style={commonStyles.optionItem}>
          <View style={commonStyles.checkbox} />
          <Text style={commonStyles.optionText}>✓ To'g'ri</Text>
        </View>
        <View style={commonStyles.optionItem}>
          <View style={commonStyles.checkbox} />
          <Text style={commonStyles.optionText}>✗ Noto‘g‘ri</Text>
        </View>
      </View>
    </View>
  );
};

// 4. SHORT_ANSWER - Короткий ответ (1 линия)
export const ShortAnswerTask: React.FC<{ content: TaskContent }> = ({ content }) => {
  const questionText = content.questionText || content.statement || '';

  return (
    <View>
      <Text style={{ fontSize: 8, color: '#666666', marginBottom: 4 }}>
        Qisqa javob yozing
      </Text>
      <Text style={commonStyles.questionText}>{questionText}</Text>

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

  return (
    <View>
      <Text style={{ fontSize: 8, color: '#666666', marginBottom: 4 }}>
        Bo‘sh joylarni to‘ldiring
      </Text>
      <Text style={commonStyles.questionText}>{questionText}</Text>

      {content.blanks && content.blanks.length > 0 && (
        <View style={[commonStyles.optionsContainer, { gap: 15 }]}>
          {content.blanks.map((_, index) => (
            <View key={index} style={{
              borderBottomWidth: 0.5,
              borderColor: '#000000',
              minWidth: 60,
              maxWidth: 120,
              height: 15,
              marginRight: 15,
            }} />
          ))}
        </View>
      )}
    </View>
  );
};

// 6. MATCHING - Сопоставление
export const MatchingTask: React.FC<{ content: TaskContent }> = ({ content }) => {
  const questionText = content.questionText || content.statement || '';

  // Перемешиваем правую колонку
  const shuffleRight = (pairs: Array<{ left: string; right: string }>) => {
    const rightItems = pairs.map((pair, idx) => ({
      text: pair.right,
      letter: String.fromCharCode(65 + idx)
    }));

    // Простое перемешивание (Fisher-Yates)
    for (let i = rightItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rightItems[i], rightItems[j]] = [rightItems[j], rightItems[i]];
    }

    return rightItems;
  };

  const shuffledRight = content.pairs ? shuffleRight(content.pairs) : [];

  return (
    <View>
      <Text style={{ fontSize: 8, color: '#666666', marginBottom: 4 }}>
        Mos keluvchi javoblarni bog‘lang
      </Text>
      <Text style={commonStyles.questionText}>{questionText}</Text>

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
                  <Text style={commonStyles.optionText}>
                    {index + 1}. {pair.left}
                  </Text>
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
                  <Text style={commonStyles.optionText}>
                    {item.letter}. {item.text}
                  </Text>
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

  return (
    <View>
      <Text style={{ fontSize: 8, color: '#666666', marginBottom: 4 }}>
        Batafsil javob yozing
      </Text>
      <Text style={commonStyles.questionText}>{questionText}</Text>

      {content.questionImage && (
        <Image src={content.questionImage} style={commonStyles.questionImage} />
      )}

      {/* 3 линии для ответа */}
      <View style={commonStyles.answerLine} />
      <View style={commonStyles.answerLine} />
      <View style={commonStyles.answerLine} />
    </View>
  );
};
