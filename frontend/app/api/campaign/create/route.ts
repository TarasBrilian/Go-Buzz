import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Received campaign creation request:', JSON.stringify(body, null, 2));

    const {
      campaignId,
      name,
      description,
      contractAddress,
      rewardAmount,
      maxParticipants,
      duration,
      creatorAddress,
      rules,
    } = body;

    // Validate required fields
    if (!campaignId || !name || !contractAddress || !rewardAmount || !creatorAddress) {
      console.error('❌ Missing required fields:', {
        campaignId: !!campaignId,
        name: !!name,
        contractAddress: !!contractAddress,
        rewardAmount: !!rewardAmount,
        creatorAddress: !!creatorAddress,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if campaign already exists
    console.log('🔍 Checking if campaign exists:', campaignId);
    const existingCampaign = await prisma.campaign.findUnique({
      where: { campaignId },
    });

    if (existingCampaign) {
      console.log('⚠️ Campaign already exists:', campaignId);
      return NextResponse.json(
        { error: 'Campaign already exists', existingCampaign },
        { status: 409 }
      );
    }

    // Find or create user
    console.log('👤 Finding/creating user:', creatorAddress);
    let user = await prisma.user.findUnique({
      where: { address: creatorAddress },
    });

    if (!user) {
      console.log('✨ Creating new user:', creatorAddress);
      user = await prisma.user.create({
        data: {
          address: creatorAddress,
        },
      });
    } else {
      console.log('✅ User found:', user.id);
    }

    // Calculate end date if duration is provided
    const endDate = duration ? new Date(Date.now() + Number(duration) * 1000) : null;
    console.log('📅 End date:', endDate);

    // Create campaign with rules in a transaction
    console.log('💾 Creating campaign with', rules?.length || 0, 'rules');
    const campaign = await prisma.$transaction(async (tx) => {
      // Create campaign
      const newCampaign = await tx.campaign.create({
        data: {
          campaignId,
          name,
          description,
          contractAddress,
          rewardAmount,
          maxParticipants,
          endDate,
          creatorId: user!.id,
        },
      });
      console.log('✅ Campaign created:', newCampaign.id);

      // Create rules if provided
      if (rules && Array.isArray(rules) && rules.length > 0) {
        console.log('📋 Creating', rules.length, 'rules');
        await tx.campaignRule.createMany({
          data: rules.map((rule: any, index: number) => ({
            campaignId: newCampaign.id,
            ruleType: rule.ruleType,
            ruleValue: rule.ruleValue || '',
            description: rule.description,
            isRequired: rule.isRequired ?? true,
            order: rule.order ?? index,
          })),
        });
        console.log('✅ Rules created successfully');
      }

      // Fetch campaign with rules
      return await tx.campaign.findUnique({
        where: { id: newCampaign.id },
        include: {
          rules: {
            orderBy: { order: 'asc' },
          },
          creator: {
            select: {
              id: true,
              address: true,
            },
          },
        },
      });
    });

    console.log('✅ Campaign saved successfully:', campaign?.id);
    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
