import { NextResponse } from 'next/server';
import { approveAction } from '@/lib/firebase/repositories/actions';
import { z } from 'zod';

const requestSchema = z.object({
  approvedBy: z.string().min(1),
  patientId: z.string().min(1) // needed for repository call
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { approvedBy, patientId } = requestSchema.parse(body);

    const updatedAction = await approveAction(resolvedParams.id, patientId, approvedBy);
    return NextResponse.json({ success: true, action: updatedAction });
  } catch (error) {
    console.error('Approve action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to approve action' },
      { status: 400 }
    );
  }
}
