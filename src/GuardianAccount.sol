// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GuardianAccount
 * @notice Minimal smart account that supports account abstraction style execution
 *         and integrates with a guardian consensus recovery module.
 */
contract GuardianAccount is ReentrancyGuard {
    address public owner;
    address public guardianModule;

    event OwnerUpdated(address indexed previousOwner, address indexed newOwner);
    event GuardianModuleSet(address indexed guardianModule);
    event Executed(
        address indexed target,
        uint256 value,
        bytes data,
        bytes result
    );

    error NotOwner(address caller);
    error NotGuardianModule(address caller);
    error ZeroAddress();
    error CallFailed(bytes data);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    modifier onlyGuardianModule() {
        if (msg.sender != guardianModule) revert NotGuardianModule(msg.sender);
        _;
    }

    constructor(address initialOwner) {
        if (initialOwner == address(0)) revert ZeroAddress();
        owner = initialOwner;
        emit OwnerUpdated(address(0), initialOwner);
    }

    receive() external payable {}

    /**
     * @notice Allows the owner to execute arbitrary calls from the account.
     * @param target Destination contract or EOA.
     * @param value Ether to forward with the call.
     * @param data Calldata payload for the target.
     * @return result Raw bytes returned by the target call.
     */
    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyOwner nonReentrant returns (bytes memory result) {
        (bool success, bytes memory returndata) = target.call{value: value}(
            data
        );
        if (!success) revert CallFailed(returndata);

        emit Executed(target, value, data, returndata);
        return returndata;
    }

    /**
     * @notice Updates the account owner.
     * @param newOwner Address of the new owner.
     */
    function updateOwner(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address previousOwner = owner;
        owner = newOwner;
        emit OwnerUpdated(previousOwner, newOwner);
    }

    /**
     * @notice Sets the guardian recovery module allowed to change ownership.
     * @param module Address of the guardian module contract.
     */
    function setGuardianModule(address module) external onlyOwner {
        if (module == address(0)) revert ZeroAddress();
        guardianModule = module;
        emit GuardianModuleSet(module);
    }

    /**
     * @notice Called by the guardian module once consensus is reached to recover ownership.
     * @param newOwner Address of the recovered owner.
     */
    function guardianRecover(address newOwner) external onlyGuardianModule {
        if (newOwner == address(0)) revert ZeroAddress();
        address previousOwner = owner;
        owner = newOwner;
        emit OwnerUpdated(previousOwner, newOwner);
    }
}
