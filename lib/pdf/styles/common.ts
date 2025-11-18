import { StyleSheet } from '@react-pdf/renderer';

// Общие стили для PDF документов
export const commonStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingTop: 25,
    paddingBottom: 25,
    paddingHorizontal: 15,
    fontFamily: 'Onest',
  },

  // Заголовок документа
  header: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: '#E9E9E9',
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'center',
    marginBottom: 8,
  },

  // Информация об ученике
  studentInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  studentInfoLabel: {
    fontSize: 10,
    fontWeight: 600,
    marginRight: 6,
  },

  studentInfoValue: {
    borderBottom: 0.5,
    borderColor: '#000000',
    width: 180,
    height: 12,
  },

  // Карточка задачи
  taskCard: {
    width: '100%',
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 2,
    borderWidth: 0.5,
    borderColor: '#E2E2E2',
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },

  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  taskNumber: {
    width: 15,
    height: 15,
    backgroundColor: '#BEDAFF',
    borderRadius: 39,
    color: '#00275B',
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 1.25,
    paddingTop: 3,
  },

  taskContent: {
    flex: 1,
    marginLeft: 8,
  },

  // Текст вопроса
  questionText: {
    fontSize: 10,
    lineHeight: 1.3,
    color: '#000000',
    marginBottom: 6,
  },

  // Изображение
  questionImage: {
    height: 120,
    objectFit: 'contain',
    borderRadius: 5.75,
    marginBottom: 6,
  },

  // Опции (горизонтальный layout)
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 6,
  },

  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  checkbox: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },

  optionText: {
    fontSize: 10,
    lineHeight: 1.3,
    color: '#000000',
  },

  // Линия для ответа
  answerLine: {
    height: 15,
    borderBottomWidth: 0.5,
    borderColor: '#000000',
    marginTop: 6,
    marginBottom: 4,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
  },

  // Водяной знак
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
});
