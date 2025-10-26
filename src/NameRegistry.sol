// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NameRegistry
 * @notice Lightweight helper contract that lets wallets associate a human-readable
 *         display name for off-chain lookups. This is intentionally permissive to
 *         keep hackathon UX simple—callers manage their own entries.
 */
contract NameRegistry {
    mapping(address => string) private _names;

    event NameRegistered(address indexed account, string name);
    event NameCleared(address indexed account);

    error EmptyName();

    /**
     * @notice Stores or updates the caller's preferred display name.
     * @param name Plain-text name to associate with the caller.
     */
    function setName(string calldata name) external {
        if (bytes(name).length == 0) revert EmptyName();

        _names[msg.sender] = name;
        emit NameRegistered(msg.sender, name);
    }

    /**
     * @notice Clears the caller's stored name.
     */
    function clearName() external {
        if (bytes(_names[msg.sender]).length == 0) {
            return;
        }

        delete _names[msg.sender];
        emit NameCleared(msg.sender);
    }

    /**
     * @notice Reads the display name associated with an address.
     * @param account Wallet address to query.
     */
    function getName(address account) external view returns (string memory) {
        return _names[account];
    }
}
