// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITemplateManager {
    function incrementUsageCount(uint256 templateId) external;
}
