import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    try {
        const { campaignId } = await params;
        const body = await request.json();
        const { userAddress, contractAddress } = body;

        if (!campaignId) {
            return NextResponse.json(
                { error: 'Campaign ID is required' },
                { status: 400 }
            );
        }

        if (!userAddress) {
            return NextResponse.json(
                { error: 'User address is required' },
                { status: 400 }
            );
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { address: userAddress },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    address: userAddress,
                },
            });
        }

        // Find campaign
        // First try by campaignId (index)
        let campaign = await prisma.campaign.findUnique({
            where: { campaignId },
        });

        // If not found and contractAddress is provided, try by contractAddress (fallback for legacy data)
        if (!campaign && contractAddress) {
            console.log(`⚠️ Campaign not found by ID ${campaignId}, trying address ${contractAddress}`);
            // Note: contractAddress is not unique in schema but logically should be unique per campaign
            const campaignsByAddress = await prisma.campaign.findMany({
                where: { contractAddress },
            });

            if (campaignsByAddress.length > 0) {
                campaign = campaignsByAddress[0];
                console.log(`✅ Found campaign by address. Updating campaignId from ${campaign.campaignId} to ${campaignId}...`);

                // Self-healing: Update the campaignId to the correct index
                try {
                    campaign = await prisma.campaign.update({
                        where: { id: campaign.id },
                        data: { campaignId },
                    });
                    console.log('✅ Campaign ID updated successfully');
                } catch (updateError) {
                    console.error('Failed to update campaign ID:', updateError);
                    // Continue even if update fails, we found the campaign
                }
            } else {
                // AUTO-SYNC: Campaign exists on chain but not in DB. Create it now!
                console.log('✨ Campaign not found in DB. Auto-creating sync record...');
                try {
                    // We need a creator for the campaign. Use the joining user as a placeholder or find a default admin.
                    // For now, we'll use the joining user as the "creator" for this DB record since we don't know the real creator
                    // This is just to allow the join to proceed.

                    campaign = await prisma.campaign.create({
                        data: {
                            campaignId: campaignId,
                            contractAddress: contractAddress,
                            name: `Campaign #${campaignId}`, // Placeholder name
                            description: 'Imported from blockchain',
                            rewardAmount: '0', // Placeholder, will be updated if needed
                            creatorId: user.id, // Use current user as placeholder creator
                            isActive: true,
                        }
                    });
                    console.log('✅ Campaign auto-created in DB:', campaign.id);
                } catch (createError) {
                    console.error('Failed to auto-create campaign:', createError);
                }
            }
        }

        if (!campaign) {
            return NextResponse.json(
                { error: 'Campaign not found in database and auto-sync failed.' },
                { status: 404 }
            );
        }

        // Check if user already joined
        const existingParticipant = await prisma.campaignParticipant.findUnique({
            where: {
                campaignId_userId: {
                    campaignId: campaign.id,
                    userId: user.id,
                },
            },
        });

        if (existingParticipant) {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Already joined',
                    participant: existingParticipant
                }
            );
        }

        // Create participant
        const participant = await prisma.campaignParticipant.create({
            data: {
                campaignId: campaign.id,
                userId: user.id,
                hasJoined: true,
                joinedAt: new Date(),
            },
        });

        // Update campaign participants count
        await prisma.campaign.update({
            where: { id: campaign.id },
            data: {
                totalParticipants: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json({
            success: true,
            participant,
        });
    } catch (error) {
        console.error('Error joining campaign:', error);
        return NextResponse.json(
            { error: 'Failed to join campaign', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
