import { PrismaClient, TaskType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreatePredefinedTaskInput {
  subject: string;
  grade: number;
  topicId?: string | null;
  taskType: TaskType;
  difficulty: Difficulty;
  question: string;
  content: any; // JSON content varies by taskType
  tags?: string[];
  createdBy?: string;
}

export interface UpdatePredefinedTaskInput {
  subject?: string;
  grade?: number;
  topicId?: string | null;
  taskType?: TaskType;
  difficulty?: Difficulty;
  question?: string;
  content?: any;
  tags?: string[];
  isActive?: boolean;
  quality?: number;
  reviewedBy?: string;
}

export interface GetPredefinedTasksFilters {
  subject?: string;
  grade?: number;
  topicId?: string;
  taskType?: TaskType;
  difficulty?: Difficulty;
  isActive?: boolean;
  tags?: string[];
  minQuality?: number;
}

// Create a new predefined task
export async function createPredefinedTask(input: CreatePredefinedTaskInput) {
  try {
    const task = await prisma.predefinedTask.create({
      data: {
        subject: input.subject,
        grade: input.grade,
        topicId: input.topicId,
        taskType: input.taskType,
        difficulty: input.difficulty,
        question: input.question,
        content: input.content,
        tags: input.tags || [],
        createdBy: input.createdBy,
      },
      include: {
        topic: true,
      },
    });
    return task;
  } catch (error) {
    console.error('Error creating predefined task:', error);
    throw error;
  }
}

// Get predefined task by ID
export async function getPredefinedTaskById(id: string) {
  try {
    const task = await prisma.predefinedTask.findUnique({
      where: { id },
      include: {
        topic: true,
      },
    });
    return task;
  } catch (error) {
    console.error('Error getting predefined task:', error);
    throw error;
  }
}

// Get predefined tasks with filters
export async function getPredefinedTasks(
  filters: GetPredefinedTasksFilters = {},
  page: number = 1,
  limit: number = 50
) {
  try {
    const where: any = {};

    if (filters.subject) where.subject = filters.subject;
    if (filters.grade) where.grade = filters.grade;
    if (filters.topicId) where.topicId = filters.topicId;
    if (filters.taskType) where.taskType = filters.taskType;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.minQuality) where.quality = { gte: filters.minQuality };
    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasEvery: filters.tags };
    }

    const [tasks, total] = await Promise.all([
      prisma.predefinedTask.findMany({
        where,
        include: {
          topic: true,
        },
        orderBy: [
          { quality: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.predefinedTask.count({ where }),
    ]);

    return {
      tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error getting predefined tasks:', error);
    throw error;
  }
}

// Get random predefined tasks for worksheet generation
export async function getRandomPredefinedTasks(
  subject: string,
  grade: number,
  taskTypes: TaskType[],
  difficulty: Difficulty,
  count: number
) {
  try {
    // Get all matching tasks
    const tasks = await prisma.predefinedTask.findMany({
      where: {
        subject,
        grade,
        taskType: { in: taskTypes },
        difficulty,
        isActive: true,
      },
      include: {
        topic: true,
      },
    });

    // Shuffle and pick random tasks
    const shuffled = tasks.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    // Increment usage count for selected tasks
    await Promise.all(
      selected.map((task) =>
        prisma.predefinedTask.update({
          where: { id: task.id },
          data: { usageCount: { increment: 1 } },
        })
      )
    );

    return selected;
  } catch (error) {
    console.error('Error getting random predefined tasks:', error);
    throw error;
  }
}

// Update predefined task
export async function updatePredefinedTask(
  id: string,
  input: UpdatePredefinedTaskInput
) {
  try {
    const task = await prisma.predefinedTask.update({
      where: { id },
      data: input,
      include: {
        topic: true,
      },
    });
    return task;
  } catch (error) {
    console.error('Error updating predefined task:', error);
    throw error;
  }
}

// Delete predefined task (soft delete by setting isActive = false)
export async function deletePredefinedTask(id: string, hardDelete: boolean = false) {
  try {
    if (hardDelete) {
      await prisma.predefinedTask.delete({
        where: { id },
      });
      return { deleted: true, hard: true };
    } else {
      await prisma.predefinedTask.update({
        where: { id },
        data: { isActive: false },
      });
      return { deleted: true, hard: false };
    }
  } catch (error) {
    console.error('Error deleting predefined task:', error);
    throw error;
  }
}

// Get statistics
export async function getPredefinedTasksStats() {
  try {
    const [total, bySubject, byGrade, byDifficulty, byType] = await Promise.all([
      prisma.predefinedTask.count({ where: { isActive: true } }),

      prisma.predefinedTask.groupBy({
        by: ['subject'],
        where: { isActive: true },
        _count: { id: true },
      }),

      prisma.predefinedTask.groupBy({
        by: ['grade'],
        where: { isActive: true },
        _count: { id: true },
      }),

      prisma.predefinedTask.groupBy({
        by: ['difficulty'],
        where: { isActive: true },
        _count: { id: true },
      }),

      prisma.predefinedTask.groupBy({
        by: ['taskType'],
        where: { isActive: true },
        _count: { id: true },
      }),
    ]);

    return {
      total,
      bySubject,
      byGrade,
      byDifficulty,
      byType,
    };
  } catch (error) {
    console.error('Error getting predefined tasks stats:', error);
    throw error;
  }
}
