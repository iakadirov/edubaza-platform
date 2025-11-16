import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { commonStyles } from '../styles/common';
import { WatermarkOptimized } from '../components/WatermarkOptimized';
import {
  SingleChoiceTask,
  MultipleChoiceTask,
  TrueFalseTask,
  ShortAnswerTask,
  FillBlanksTask,
  MatchingTask,
  EssayTask,
} from '../components/TaskComponents';

interface Task {
  id: string;
  content: any;
}

interface WorksheetData {
  title: string;
  subject?: string;
  grade?: number;
  quarter?: number;
  week?: number;
  tasks: Task[];
}

const TaskRenderer: React.FC<{ task: Task; index: number }> = ({ task, index }) => {
  const taskType = task.content.task_type?.toUpperCase();

  let TaskComponent;
  switch (taskType) {
    case 'SINGLE_CHOICE':
      TaskComponent = SingleChoiceTask;
      break;
    case 'MULTIPLE_CHOICE':
      TaskComponent = MultipleChoiceTask;
      break;
    case 'TRUE_FALSE':
      TaskComponent = TrueFalseTask;
      break;
    case 'SHORT_ANSWER':
      TaskComponent = ShortAnswerTask;
      break;
    case 'FILL_BLANKS':
      TaskComponent = FillBlanksTask;
      break;
    case 'MATCHING':
      TaskComponent = MatchingTask;
      break;
    case 'ESSAY':
      TaskComponent = EssayTask;
      break;
    default:
      return null;
  }

  return (
    <View style={commonStyles.taskCard}>
      <View style={commonStyles.taskHeader}>
        <Text style={commonStyles.taskNumber}>{index + 1}</Text>
        <View style={commonStyles.taskContent}>
          <TaskComponent content={task.content} />
        </View>
      </View>
    </View>
  );
};

export const WorksheetPDF: React.FC<{ data: WorksheetData }> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        {/* Watermark - SVG-based, renders on all pages with 'fixed' attribute */}
        <WatermarkOptimized mode="diagonal" />

        {/* Header */}
        <View style={commonStyles.header}>
          <Text style={commonStyles.headerTitle}>{data.title}</Text>

          <View style={commonStyles.studentInfo}>
            <View style={commonStyles.studentInfoItem}>
              <Text style={commonStyles.studentInfoLabel}>F.I.O:</Text>
              <Text style={commonStyles.studentInfoValue}></Text>
            </View>
            <View style={commonStyles.studentInfoItem}>
              <Text style={commonStyles.studentInfoLabel}>Sinf:</Text>
              <Text style={commonStyles.studentInfoValue}></Text>
            </View>
          </View>
        </View>

        {/* Tasks */}
        {data.tasks.map((task, index) => (
          <TaskRenderer key={task.id} task={task} index={index} />
        ))}

        {/* Footer */}
        <Text style={commonStyles.footer}>
          © {new Date().getFullYear()} EduBaza.uz - Barcha huquqlar himoyalangan
        </Text>
      </Page>
    </Document>
  );
};
