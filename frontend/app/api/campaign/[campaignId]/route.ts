import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Fetch campaign with rules and creator
    const campaign = await prisma.campaign.findUnique({
      where: {
        campaignId: campaignId,
      },
      include: {
        rules: {
          orderBy: {
            order: 'asc',
          },
        },
        creator: {
          select: {
            id: true,
            address: true,
            twitterHandle: true,
            twitterUsername: true,
          },
        },
        _count: {
          select: {
            participants: true,
            claims: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if user has joined (if userAddress is provided)
    const url = new URL(request.url);
    const userAddress = url.searchParams.get('userAddress');
    let hasJoined = false;

    if (userAddress) {
      const user = await prisma.user.findUnique({
        where: { address: userAddress },
      });

      if (user) {
        const participant = await prisma.campaignParticipant.findUnique({
          where: {
            campaignId_userId: {
              campaignId: campaign.id,
              userId: user.id,
            },
          },
        });
        hasJoined = !!participant;
      }
    }

    return NextResponse.json({
      success: true,
      campaign,
      hasJoined,
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
