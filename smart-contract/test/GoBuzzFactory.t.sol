// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import {GoBuzz} from "../src/GoBuzz.sol";
import {GoBuzzFactory} from "../src/Factory.sol";
import {MockUSDC} from "../src/tokens/MockUSDC.sol";

contract GoBuzzFactoryTest is Test {
    GoBuzzFactory public factory;
    MockUSDC public usdc;

    address public owner = address(this);
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public campaignCreator = address(0x3);

    uint256 constant INITIAL_REWARD = 10000e18; // 10,000 tokens
    uint256 constant REWARD_PER_CLAIM = 10e18; // 10 tokens
    uint256 constant CAMPAIGN_DURATION = 30 days;

    event CampaignCreated(
        address indexed campaignAddress,
        address indexed creator,
        string campaignName,
        uint256 duration,
        uint256 initialReward,
        uint256 rewardPerClaim
    );

    function setUp() public {
        // Deploy contracts
        factory = new GoBuzzFactory();
        usdc = new MockUSDC();

        // Mint tokens to campaign creator
        usdc.mint(campaignCreator, 100000e18);

        // Mint tokens to users for testing
        usdc.mint(user1, 1000e18);
        usdc.mint(user2, 1000e18);
    }

    // ============ Factory Tests ============

    function testCreateCampaign() public {
        vm.startPrank(campaignCreator);

        // Approve factory to spend tokens
        usdc.approve(address(factory), INITIAL_REWARD);

        // Create campaign
        address campaignAddress = factory.createCampaign(
            "Summer Promo 2025",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );

        vm.stopPrank();

        // Verify campaign was created
        assertEq(factory.getCampaignCount(), 1);
        address[] memory campaigns = factory.getCampaigns();
        assertEq(campaigns[0], campaignAddress);

        // Verify campaign ownership
        address[] memory userCampaigns = factory.getUserCampaigns(campaignCreator);
        assertEq(userCampaigns.length, 1);
        assertEq(userCampaigns[0], campaignAddress);

        // Verify tokens were transferred
        assertEq(usdc.balanceOf(campaignAddress), INITIAL_REWARD);
    }

    function testCreateCampaignEmitEvent() public {
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);

        vm.expectEmit(false, true, false, true);
        emit CampaignCreated(
            address(0), // We don't know the address yet
            campaignCreator,
            "Test Campaign",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            REWARD_PER_CLAIM
        );

        factory.createCampaign(
            "Test Campaign",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );

        vm.stopPrank();
    }

    function testCreateMultipleCampaigns() public {
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD * 3);

        factory.createCampaign("Campaign 1", CAMPAIGN_DURATION, INITIAL_REWARD, REWARD_PER_CLAIM, address(usdc));
        factory.createCampaign("Campaign 2", CAMPAIGN_DURATION, INITIAL_REWARD, REWARD_PER_CLAIM, address(usdc));
        factory.createCampaign("Campaign 3", CAMPAIGN_DURATION, INITIAL_REWARD, REWARD_PER_CLAIM, address(usdc));

        vm.stopPrank();

        assertEq(factory.getCampaignCount(), 3);

        address[] memory userCampaigns = factory.getUserCampaigns(campaignCreator);
        assertEq(userCampaigns.length, 3);
    }

    function testRevertCreateCampaignEmptyName() public {
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);

        vm.expectRevert("Campaign name required");
        factory.createCampaign(
            "",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );

        vm.stopPrank();
    }

    function testRevertCreateCampaignZeroDuration() public {
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);

        vm.expectRevert("Duration must be greater than 0");
        factory.createCampaign(
            "Test Campaign",
            0,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );

        vm.stopPrank();
    }

    function testRevertCreateCampaignZeroInitialReward() public {
        vm.startPrank(campaignCreator);

        vm.expectRevert("Initial reward must be greater than 0");
        factory.createCampaign(
            "Test Campaign",
            CAMPAIGN_DURATION,
            0,
            REWARD_PER_CLAIM,
            address(usdc)
        );

        vm.stopPrank();
    }

    function testRevertCreateCampaignZeroRewardPerClaim() public {
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);

        vm.expectRevert("Reward per claim must be greater than 0");
        factory.createCampaign(
            "Test Campaign",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            0,
            address(usdc)
        );

        vm.stopPrank();
    }

    function testRevertCreateCampaignInvalidTokenAddress() public {
        vm.startPrank(campaignCreator);

        vm.expectRevert("Invalid token address");
        factory.createCampaign(
            "Test Campaign",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(0)
        );

        vm.stopPrank();
    }

    // ============ Campaign Tests ============

    function testClaimReward() public {
        // Create campaign
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);
        address campaignAddress = factory.createCampaign(
            "Test Campaign",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );
        vm.stopPrank();

        GoBuzz campaign = GoBuzz(campaignAddress);

        // User claims reward
        vm.prank(user1);
        campaign.claimReward();

        // Verify user received tokens
        assertEq(usdc.balanceOf(user1), 1000e18 + REWARD_PER_CLAIM);

        // Verify campaign state
        assertEq(campaign.claimedAmount(), REWARD_PER_CLAIM);
        assertEq(campaign.userClaims(user1), REWARD_PER_CLAIM);
        assertEq(campaign.lastClaimTime(user1), block.timestamp);
    }

    function testMultipleUsersClaim() public {
        // Create campaign
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);
        address campaignAddress = factory.createCampaign(
            "Test Campaign",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );
        vm.stopPrank();

        GoBuzz campaign = GoBuzz(campaignAddress);

        // Multiple users claim
        vm.prank(user1);
        campaign.claimReward();

        vm.prank(user2);
        campaign.claimReward();

        // Verify balances
        assertEq(usdc.balanceOf(user1), 1000e18 + REWARD_PER_CLAIM);
        assertEq(usdc.balanceOf(user2), 1000e18 + REWARD_PER_CLAIM);

        // Verify total claimed
        assertEq(campaign.claimedAmount(), REWARD_PER_CLAIM * 2);
    }

    function testUserCanClaimMultipleTimes() public {
        // Create campaign
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);
        address campaignAddress = factory.createCampaign(
            "Test Campaign",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );
        vm.stopPrank();

        GoBuzz campaign = GoBuzz(campaignAddress);

        // User claims multiple times
        vm.startPrank(user1);
        campaign.claimReward();
        campaign.claimReward();
        campaign.claimReward();
        vm.stopPrank();

        // Verify total claims
        assertEq(campaign.userClaims(user1), REWARD_PER_CLAIM * 3);
        assertEq(usdc.balanceOf(user1), 1000e18 + (REWARD_PER_CLAIM * 3));
    }

    function testRevertClaimAfterCampaignEnded() public {
        // Create campaign with short duration
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);
        address campaignAddress = factory.createCampaign(
            "Test Campaign",
            1 days,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );
        vm.stopPrank();

        GoBuzz campaign = GoBuzz(campaignAddress);

        // Fast forward past campaign end
        vm.warp(block.timestamp + 2 days);

        vm.prank(user1);
        vm.expectRevert("Campaign has ended");
        campaign.claimReward();
    }

    function testRevertClaimWhenRewardPoolDepleted() public {
        uint256 smallReward = REWARD_PER_CLAIM * 2;

        // Create campaign with small reward pool
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), smallReward);
        address campaignAddress = factory.createCampaign(
            "Test Campaign",
            CAMPAIGN_DURATION,
            smallReward,
            REWARD_PER_CLAIM,
            address(usdc)
        );
        vm.stopPrank();

        GoBuzz campaign = GoBuzz(campaignAddress);

        // Claim all available rewards
        vm.prank(user1);
        campaign.claimReward();

        vm.prank(user2);
        campaign.claimReward();

        // Try to claim when pool is depleted
        vm.prank(user1);
        vm.expectRevert("Reward pool depleted");
        campaign.claimReward();
    }

    function testFundCampaign() public {
        // Create campaign
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);
        address campaignAddress = factory.createCampaign(
            "Test Campaign",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );

        // Fund additional rewards
        uint256 additionalFunding = 5000e18;
        usdc.approve(campaignAddress, additionalFunding);

        GoBuzz campaign = GoBuzz(campaignAddress);
        campaign.fundCampaign(additionalFunding);

        vm.stopPrank();

        // Verify pool increased
        assertEq(campaign.totalRewardPool(), INITIAL_REWARD + additionalFunding);
        assertEq(usdc.balanceOf(campaignAddress), INITIAL_REWARD + additionalFunding);
    }

    function testRevertFundCampaignNotOwner() public {
        // Create campaign
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);
        address campaignAddress = factory.createCampaign(
            "Test Campaign",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );
        vm.stopPrank();

        GoBuzz campaign = GoBuzz(campaignAddress);

        // Try to fund from non-owner
        vm.prank(user1);
        vm.expectRevert();
        campaign.fundCampaign(1000e18);
    }

    function testEndCampaign() public {
        // Create campaign
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);
        address campaignAddress = factory.createCampaign(
            "Test Campaign",
            1 days,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );
        vm.stopPrank();

        GoBuzz campaign = GoBuzz(campaignAddress);

        // Some users claim
        vm.prank(user1);
        campaign.claimReward();

        uint256 claimed = campaign.claimedAmount();
        uint256 remaining = INITIAL_REWARD - claimed;

        // Fast forward past campaign end
        vm.warp(block.timestamp + 2 days);

        // End campaign
        uint256 creatorBalanceBefore = usdc.balanceOf(campaignCreator);
        vm.prank(campaignCreator);
        campaign.endCampaign();

        // Verify remaining funds returned to owner
        assertEq(usdc.balanceOf(campaignCreator), creatorBalanceBefore + remaining);
    }

    function testRevertEndCampaignStillActive() public {
        // Create campaign
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);
        address campaignAddress = factory.createCampaign(
            "Test Campaign",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );
        vm.stopPrank();

        GoBuzz campaign = GoBuzz(campaignAddress);

        // Try to end while still active
        vm.prank(campaignCreator);
        vm.expectRevert("Campaign still active");
        campaign.endCampaign();
    }

    function testGetRemainingRewards() public {
        // Create campaign
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);
        address campaignAddress = factory.createCampaign(
            "Test Campaign",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );
        vm.stopPrank();

        GoBuzz campaign = GoBuzz(campaignAddress);

        // Check initial remaining
        assertEq(campaign.getRemainingRewards(), INITIAL_REWARD);

        // Claim some rewards
        vm.prank(user1);
        campaign.claimReward();

        // Check remaining after claim
        assertEq(campaign.getRemainingRewards(), INITIAL_REWARD - REWARD_PER_CLAIM);
    }

    function testGetCampaignInfo() public {
        // Create campaign
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);
        address campaignAddress = factory.createCampaign(
            "Summer Promo",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );
        vm.stopPrank();

        GoBuzz campaign = GoBuzz(campaignAddress);

        (
            string memory name,
            uint256 start,
            uint256 end,
            uint256 totalPool,
            uint256 claimed,
            uint256 remaining,
            uint256 rewardAmount,
            bool isActive
        ) = campaign.getCampaignInfo();

        assertEq(name, "Summer Promo");
        assertEq(start, block.timestamp);
        assertEq(end, block.timestamp + CAMPAIGN_DURATION);
        assertEq(totalPool, INITIAL_REWARD);
        assertEq(claimed, 0);
        assertEq(remaining, INITIAL_REWARD);
        assertEq(rewardAmount, REWARD_PER_CLAIM);
        assertTrue(isActive);
    }

    function testGetCampaignInfoAfterClaims() public {
        // Create campaign
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);
        address campaignAddress = factory.createCampaign(
            "Test Campaign",
            CAMPAIGN_DURATION,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );
        vm.stopPrank();

        GoBuzz campaign = GoBuzz(campaignAddress);

        // Make some claims
        vm.prank(user1);
        campaign.claimReward();

        vm.prank(user2);
        campaign.claimReward();

        (
            ,
            ,
            ,
            ,
            uint256 claimed,
            uint256 remaining,
            ,
            bool isActive
        ) = campaign.getCampaignInfo();

        assertEq(claimed, REWARD_PER_CLAIM * 2);
        assertEq(remaining, INITIAL_REWARD - (REWARD_PER_CLAIM * 2));
        assertTrue(isActive);
    }

    function testCampaignIsNotActiveAfterEnd() public {
        // Create campaign with short duration
        vm.startPrank(campaignCreator);
        usdc.approve(address(factory), INITIAL_REWARD);
        address campaignAddress = factory.createCampaign(
            "Test Campaign",
            1 days,
            INITIAL_REWARD,
            REWARD_PER_CLAIM,
            address(usdc)
        );
        vm.stopPrank();

        GoBuzz campaign = GoBuzz(campaignAddress);

        // Fast forward past campaign end
        vm.warp(block.timestamp + 2 days);

        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            bool isActive
        ) = campaign.getCampaignInfo();

        assertFalse(isActive);
    }
}
