import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface RouteParams {
  params: {
    id: string;
    taskId: string;
  };
}

// DELETE - Remove task from worksheet
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id: worksheetId, taskId } = params;

    // Delete from worksheet_tasks junction table
    const query = `DELETE FROM worksheet_tasks WHERE worksheet_id = '${worksheetId}' AND task_id = '${taskId}'`;
    const dockerCmd = `docker exec edubaza_postgres psql -U edubaza -d edubaza -c "${query}"`;

    await execAsync(dockerCmd);

    return NextResponse.json({
      success: true,
      message: 'Task removed from worksheet successfully',
    });
  } catch (error) {
    console.error('Error deleting worksheet task:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete task',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
