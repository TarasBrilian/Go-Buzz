// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {GoBuzzFactory} from "../src/Factory.sol";
import {MockUSDC} from "../src/tokens/MockUSDC.sol";
import {console} from "forge-std/console.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy MockUSDC token (untuk testing di testnet)
        MockUSDC mockUSDC = new MockUSDC();
        console.log("MockUSDC deployed at:", address(mockUSDC));

        // Deploy GoBuzzFactory
        GoBuzzFactory factory = new GoBuzzFactory();
        console.log("GoBuzzFactory deployed at:", address(factory));

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== Deployment Summary ===");
        console.log("Network: Base Sepolia");
        console.log("MockUSDC Address:", address(mockUSDC));
        console.log("GoBuzzFactory Address:", address(factory));
        console.log("========================\n");
    }
}
