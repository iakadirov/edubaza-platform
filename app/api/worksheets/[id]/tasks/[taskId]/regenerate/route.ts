import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { generateTasks } from '@/lib/gemini';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface RouteParams {
  params: {
    id: string;
    taskId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { taskId } = params;

    // First, get the current task to understand its parameters
    const selectQuery = `
      SELECT ci.id, ci.content, ci.difficulty, t.id as topic_id, s.code as subject_code
      FROM content_items ci
      INNER JOIN topics t ON ci.topic_id = t.id
      INNER JOIN subjects s ON t.subject_id = s.id
      WHERE ci.id = '${taskId}'
    `;
    const dockerSelectCmd = `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -F"|" -c "${selectQuery}"`;

    const { stdout } = await execAsync(dockerSelectCmd);
    const line = stdout.trim();

    if (!line) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    const [id, contentJson, difficulty, topicId, subjectCode] = line.split('|');

    let oldContent;
    try {
      oldContent = JSON.parse(contentJson);
    } catch {
      oldContent = {};
    }

    // Generate a new task with the same parameters
    const newTasks = await generateTasks({
      subjectCode: subjectCode,
      topicId: topicId,
      difficulty: difficulty || 'MEDIUM',
      count: 1,
      taskType: oldContent.type || 'MULTIPLE_CHOICE',
    });

    if (newTasks.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to regenerate task' },
        { status: 500 }
      );
    }

    const newTask = newTasks[0];

    // Update the task content with regenerated data
    const updatedContent = {
      ...newTask.content,
      metadata: {
        ...oldContent.metadata,
        isAiGenerated: true,
        regeneratedAt: new Date().toISOString(),
        approved: false, // Reset approval status on regeneration
      },
    };

    // Update in database
    const updatedContentJson = JSON.stringify(updatedContent).replace(/'/g, "''");
    const titleEsc = newTask.titleUz.replace(/'/g, "''");

    const updateQuery = `
      UPDATE content_items
      SET
        title_uz = '${titleEsc}',
        content = '${updatedContentJson}',
        updated_at = NOW()
      WHERE id = '${taskId}'
    `;
    const dockerUpdateCmd = `docker exec edubaza_postgres psql -U edubaza -d edubaza -c "${updateQuery}"`;

    await execAsync(dockerUpdateCmd);

    // Return the updated task
    return NextResponse.json({
      success: true,
      message: 'Task regenerated successfully',
      data: {
        id: taskId,
        titleUz: newTask.titleUz,
        content: updatedContent,
        difficulty: difficulty,
        metadata: updatedContent.metadata,
      },
    });
  } catch (error) {
    console.error('Error regenerating task:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to regenerate task',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
