//SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {GoBuzz} from "./GoBuzz.sol";

contract GoBuzzFactory is Ownable {
    address[] public campaigns;
    mapping(address => address[]) public userCampaigns;

    event CampaignCreated(
        address indexed campaignAddress,
        address indexed creator,
        string campaignName,
        uint256 duration,
        uint256 initialReward,
        uint256 rewardPerClaim
    );

    constructor() Ownable(msg.sender) {}

    function createCampaign(
        string memory _campaignName,
        uint256 _duration,
        uint256 _initialReward,
        uint256 _rewardPerClaim,
        address _rewardToken
    ) external returns (address) {
        require(bytes(_campaignName).length > 0, "Campaign name required");
        require(_duration > 0, "Duration must be greater than 0");
        require(_initialReward > 0, "Initial reward must be greater than 0");
        require(_rewardPerClaim > 0, "Reward per claim must be greater than 0");
        require(_rewardToken != address(0), "Invalid token address");

        GoBuzz newCampaign = new GoBuzz(
            _campaignName,
            _duration,
            _initialReward,
            _rewardPerClaim,
            _rewardToken,
            msg.sender
        );

        address campaignAddress = address(newCampaign);
        campaigns.push(campaignAddress);
        userCampaigns[msg.sender].push(campaignAddress);

        IERC20(_rewardToken).transferFrom(msg.sender, campaignAddress, _initialReward);

        emit CampaignCreated(
            campaignAddress,
            msg.sender,
            _campaignName,
            _duration,
            _initialReward,
            _rewardPerClaim
        );

        return campaignAddress;
    }

    function getCampaigns() external view returns (address[] memory) {
        return campaigns;
    }

    function getUserCampaigns(address _user) external view returns (address[] memory) {
        return userCampaigns[_user];
    }

    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }
}