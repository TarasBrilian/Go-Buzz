// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GoBuzz is Ownable, ReentrancyGuard {
    string public campaignName;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public totalRewardPool;
    uint256 public rewardPerClaim;
    uint256 public claimedAmount;
    IERC20 public rewardToken;

    mapping(address => uint256) public userClaims;
    mapping(address => uint256) public lastClaimTime;

    event RewardClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event CampaignFunded(uint256 amount);
    event CampaignEnded(uint256 remainingRewards);

    constructor(
        string memory _campaignName,
        uint256 _duration,
        uint256 _initialReward,
        uint256 _rewardPerClaim,
        address _rewardToken,
        address _owner
    ) Ownable(_owner) {
        require(_duration > 0, "Duration must be greater than 0");
        require(_initialReward > 0, "Initial reward must be greater than 0");
        require(_rewardPerClaim > 0, "Reward per claim must be greater than 0");
        require(_rewardToken != address(0), "Invalid token address");

        campaignName = _campaignName;
        startTime = block.timestamp;
        endTime = block.timestamp + _duration;
        totalRewardPool = _initialReward;
        rewardPerClaim = _rewardPerClaim;
        rewardToken = IERC20(_rewardToken);
    }

    function claimReward() external nonReentrant {
        require(block.timestamp >= startTime, "Campaign not started");
        require(block.timestamp <= endTime, "Campaign has ended");
        require(claimedAmount + rewardPerClaim <= totalRewardPool, "Reward pool depleted");

        uint256 amountToClaim = rewardPerClaim;

        userClaims[msg.sender] += amountToClaim;
        lastClaimTime[msg.sender] = block.timestamp;
        claimedAmount += amountToClaim;

        require(rewardToken.transfer(msg.sender, amountToClaim), "Transfer failed");

        emit RewardClaimed(msg.sender, amountToClaim, block.timestamp);
    }

    function fundCampaign(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        require(rewardToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        totalRewardPool += _amount;
        emit CampaignFunded(_amount);
    }

    function endCampaign() external onlyOwner {
        require(block.timestamp > endTime, "Campaign still active");

        uint256 remainingRewards = totalRewardPool - claimedAmount;
        if (remainingRewards > 0) {
            require(rewardToken.transfer(owner(), remainingRewards), "Transfer failed");
        }

        emit CampaignEnded(remainingRewards);
    }

    function getRemainingRewards() external view returns (uint256) {
        return totalRewardPool - claimedAmount;
    }

    function getCampaignInfo() external view returns (
        string memory name,
        uint256 start,
        uint256 end,
        uint256 totalPool,
        uint256 claimed,
        uint256 remaining,
        uint256 rewardAmount,
        bool isActive
    ) {
        return (
            campaignName,
            startTime,
            endTime,
            totalRewardPool,
            claimedAmount,
            totalRewardPool - claimedAmount,
            rewardPerClaim,
            block.timestamp >= startTime && block.timestamp <= endTime
        );
    }
}

