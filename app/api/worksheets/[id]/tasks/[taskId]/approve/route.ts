import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { executeSql } from '@/lib/db-helper';

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

    // First, get the current content
    const selectQuery = `SELECT content FROM content_items WHERE id = '${taskId}'`;

    const stdout = await executeSql(selectQuery);
    const contentJson = stdout.trim();

    let content;
    try {
      content = JSON.parse(contentJson);
    } catch {
      content = {};
    }

    // Update metadata to mark as approved
    if (!content.metadata) {
      content.metadata = {};
    }
    content.metadata.approved = true;
    content.metadata.approvedAt = new Date().toISOString();

    // Update the task in database
    const updatedContentJson = JSON.stringify(content).replace(/'/g, "''");
    const updateQuery = `UPDATE content_items SET content = '${updatedContentJson}' WHERE id = '${taskId}'`;

    await executeSql(updateQuery);

    return NextResponse.json({
      success: true,
      message: 'Task approved successfully',
      data: {
        id: taskId,
        metadata: content.metadata,
      },
    });
  } catch (error) {
    console.error('Error approving task:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to approve task',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
