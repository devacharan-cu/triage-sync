import { NextResponse } from 'next/server';
import { rejectAction } from '@/lib/firebase/repositories/actions';
import { z } from 'zod';

const requestSchema = z.object({
  rejectedBy: z.string().min(1),
  patientId: z.string().min(1),
  reason: z.string().optional()
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { rejectedBy, patientId, reason } = requestSchema.parse(body);

    const updatedAction = await rejectAction(resolvedParams.id, patientId, rejectedBy, reason);
    return NextResponse.json({ success: true, action: updatedAction });
  } catch (error) {
    console.error('Reject action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reject action' },
      { status: 400 }
    );
  }
}
