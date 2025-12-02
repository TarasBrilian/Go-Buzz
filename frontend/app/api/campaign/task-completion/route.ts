import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, userAddress, ruleId, ruleType, verificationData } = body;

    // Validate required fields
    if (!campaignId || !userAddress || !ruleId || !ruleType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find or create user by wallet address
    let user = await prisma.user.findUnique({
      where: { address: userAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { address: userAddress },
      });
    }

    // Find campaign by numeric campaignId
    const campaign = await prisma.campaign.findUnique({
      where: { campaignId: String(campaignId) },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if user already completed this task
    const existing = await prisma.taskCompletion.findFirst({
      where: {
        campaignId: campaign.id,
        userId: user.id,
        ruleId: ruleId,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task already completed. You cannot complete the same task twice.',
          alreadyCompleted: true,
        },
        { status: 400 }
      );
    }

    // Save task completion
    const taskCompletion = await prisma.taskCompletion.create({
      data: {
        campaignId: campaign.id,
        userId: user.id,
        ruleId: ruleId,
        ruleType: ruleType,
        verificationData: JSON.stringify(verificationData),
        isVerified: true,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: taskCompletion.id,
        message: 'Task completion saved successfully',
      },
    });
  } catch (error) {
    console.error('Error saving task completion:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/campaign/task-completion?campaignId=1&userAddress=0x...&ruleId=rule1
 * Check if user already completed a specific task
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId');
    const userAddress = searchParams.get('userAddress');
    const ruleId = searchParams.get('ruleId');

    console.log('[TASK-COMPLETION-GET] Params:', { campaignId, userAddress, ruleId });

    if (!campaignId || !userAddress || !ruleId) {
      return NextResponse.json(
        { success: false, error: 'Missing required query parameters' },
        { status: 400 }
      );
    }

    // Find user
    console.log('[TASK-COMPLETION-GET] Finding user by address:', userAddress);
    const user = await prisma.user.findUnique({
      where: { address: userAddress },
    });

    if (!user) {
      // User doesn't exist, so task not completed
      console.log('[TASK-COMPLETION-GET] User not found, returning isCompleted: false');
      return NextResponse.json({
        success: true,
        data: { isCompleted: false },
      });
    }

    console.log('[TASK-COMPLETION-GET] User found:', user.id);

    console.log('[TASK-COMPLETION-GET] Campaign lookup query:', String(campaignId));
    const campaign = await prisma.campaign.findUnique({
      where: { campaignId: String(campaignId) },
      select: { id: true }, // Only select ID to minimize data transfer
    });

    if (!campaign) {
      console.log('[TASK-COMPLETION-GET] Campaign not found with campaignId:', campaignId);
      // Return safe default instead of error
      return NextResponse.json({
        success: true,
        data: { isCompleted: false },
      });
    }

    // Check if task completed
    console.log('[TASK-COMPLETION-GET] Checking task completion:', { campaignId: campaign?.id, userId: user.id, ruleId });
    
    if (!campaign) {
      console.log('[TASK-COMPLETION-GET] Campaign is null, returning isCompleted: false');
      return NextResponse.json({
        success: true,
        data: { isCompleted: false },
      });
    }
    
    const completion = await prisma.taskCompletion.findFirst({
      where: {
        campaignId: campaign.id,
        userId: user.id,
        ruleId: ruleId,
      },
    });

    console.log('[TASK-COMPLETION-GET] Task completion result:', completion ? 'Found' : 'Not found');

    return NextResponse.json({
      success: true,
      data: {
        isCompleted: !!completion,
        completion: completion
          ? {
              id: completion.id,
              completedAt: completion.completedAt,
              verificationData: completion.verificationData
                ? JSON.parse(completion.verificationData)
                : null,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('[TASK-COMPLETION-GET] Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
