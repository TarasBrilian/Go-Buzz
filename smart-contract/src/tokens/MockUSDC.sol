// SPDX-License-Identifier: MIT

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

pragma solidity ^0.8.30;

contract MockUSDC is ERC20 {

    constructor() ERC20("Mock USDC", "MUSDC"){}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}