// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IGuardianAccount {
    function guardianRecover(address newOwner) external;

    function guardianModule() external view returns (address);
}

/**
 * @title GuardianRecovery
 * @notice Guardian-based ownership recovery module for GuardianAccount instances.
 */
contract GuardianRecovery is ReentrancyGuard {
    struct RecoveryState {
        address proposedOwner;
        uint256 approvals;
        uint256 round;
        bool active;
    }

    struct GuardianConfig {
        address[] guardians;
        uint256 threshold;
        mapping(address => bool) isGuardian;
    }

    mapping(address => GuardianConfig) private _guardianConfigs;
    mapping(address => RecoveryState) private _recoveryStates;
    mapping(address => mapping(address => uint256))
        private _guardianApprovalRound;

    event GuardiansConfigured(
        address indexed account,
        uint256 threshold,
        address[] guardians
    );
    event RecoveryInitiated(
        address indexed account,
        address indexed proposedOwner,
        address indexed initiator,
        uint256 round
    );
    event RecoveryApproved(
        address indexed account,
        address indexed guardian,
        uint256 approvals,
        uint256 threshold
    );
    event RecoveryExecuted(address indexed account, address indexed newOwner);
    event RecoveryCancelled(address indexed account);

    error NotGuardian(address account, address caller);
    error GuardiansNotConfigured(address account);
    error InvalidThreshold();
    error DuplicateGuardian(address guardian);
    error ZeroAddress();
    error RecoveryNotActive(address account);
    error AlreadyApproved(address account, address guardian);
    error ModuleMismatch(address account);

    modifier onlyAccount(address account) {
        if (msg.sender != account) revert NotGuardian(account, msg.sender);
        _;
    }

    /**
     * @notice Configures guardians and threshold for the calling account.
     * @param guardians Array of guardian addresses.
     * @param threshold Number of guardian approvals required for recovery.
     */
    function configureGuardians(
        address[] calldata guardians,
        uint256 threshold
    ) external {
        address account = msg.sender;
        if (guardians.length == 0) revert InvalidThreshold();
        if (threshold == 0 || threshold > guardians.length)
            revert InvalidThreshold();

        GuardianConfig storage config = _guardianConfigs[account];

        // Reset existing guardian flags
        uint256 previousGuardianCount = config.guardians.length;
        for (uint256 i = 0; i < previousGuardianCount; ++i) {
            config.isGuardian[config.guardians[i]] = false;
        }

        delete config.guardians;

        // Store new guardians, guarding against duplicates/zero addresses
        for (uint256 i = 0; i < guardians.length; ++i) {
            address guardian = guardians[i];
            if (guardian == address(0)) revert ZeroAddress();
            if (config.isGuardian[guardian]) revert DuplicateGuardian(guardian);

            config.isGuardian[guardian] = true;
            config.guardians.push(guardian);
        }

        config.threshold = threshold;

        // Cancel any active recovery attempt when configuration changes
        RecoveryState storage state = _recoveryStates[account];
        if (state.active) {
            _resetRecovery(state);
            emit RecoveryCancelled(account);
        }

        emit GuardiansConfigured(account, threshold, guardians);
    }

    /**
     * @notice Initiates a recovery attempt for an account.
     * @param account Guardian account undergoing recovery.
     * @param newOwner Proposed new owner address.
     */
    function initiateRecovery(
        address account,
        address newOwner
    ) external nonReentrant {
        GuardianConfig storage config = _guardianConfigs[account];
        if (config.threshold == 0) revert GuardiansNotConfigured(account);
        if (!config.isGuardian[msg.sender])
            revert NotGuardian(account, msg.sender);
        if (newOwner == address(0)) revert ZeroAddress();

        RecoveryState storage state = _recoveryStates[account];
        state.proposedOwner = newOwner;
        state.approvals = 0;
        state.active = true;
        uint256 round = ++state.round;

        _approve(account, config, state, round, msg.sender);

        emit RecoveryInitiated(account, newOwner, msg.sender, round);
    }

    /**
     * @notice Approves an active recovery attempt for an account.
     * @param account Guardian account undergoing recovery.
     */
    function approveRecovery(address account) external nonReentrant {
        GuardianConfig storage config = _guardianConfigs[account];
        if (config.threshold == 0) revert GuardiansNotConfigured(account);
        if (!config.isGuardian[msg.sender])
            revert NotGuardian(account, msg.sender);

        RecoveryState storage state = _recoveryStates[account];
        if (!state.active) revert RecoveryNotActive(account);

        uint256 round = state.round;
        _approve(account, config, state, round, msg.sender);
    }

    /**
     * @notice Cancels an active recovery attempt. Callable only by the account itself.
     * @param account Guardian account to cancel recovery for.
     */
    function cancelRecovery(address account) external onlyAccount(account) {
        RecoveryState storage state = _recoveryStates[account];
        if (!state.active) revert RecoveryNotActive(account);
        _resetRecovery(state);
        emit RecoveryCancelled(account);
    }

    /**
     * @notice Returns guardian configuration for an account.
     */
    function getGuardians(
        address account
    ) external view returns (address[] memory guardians, uint256 threshold) {
        GuardianConfig storage config = _guardianConfigs[account];
        guardians = config.guardians;
        threshold = config.threshold;
    }

    /**
     * @notice Returns active recovery state for an account.
     */
    function getRecoveryState(
        address account
    )
        external
        view
        returns (
            bool active,
            address proposedOwner,
            uint256 approvals,
            uint256 threshold
        )
    {
        RecoveryState storage state = _recoveryStates[account];
        GuardianConfig storage config = _guardianConfigs[account];
        return (
            state.active,
            state.proposedOwner,
            state.approvals,
            config.threshold
        );
    }

    function _approve(
        address account,
        GuardianConfig storage config,
        RecoveryState storage state,
        uint256 round,
        address guardian
    ) private {
        if (_guardianApprovalRound[account][guardian] == round) {
            revert AlreadyApproved(account, guardian);
        }
        _guardianApprovalRound[account][guardian] = round;

        unchecked {
            state.approvals += 1;
        }

        emit RecoveryApproved(
            account,
            guardian,
            state.approvals,
            config.threshold
        );

        if (state.approvals >= config.threshold) {
            _finalizeRecovery(account, state);
        }
    }

    function _finalizeRecovery(
        address account,
        RecoveryState storage state
    ) private {
        address module = IGuardianAccount(account).guardianModule();
        if (module != address(this)) revert ModuleMismatch(account);

        address newOwner = state.proposedOwner;
        _resetRecovery(state);

        IGuardianAccount(account).guardianRecover(newOwner);
        emit RecoveryExecuted(account, newOwner);
    }

    function _resetRecovery(RecoveryState storage state) private {
        state.active = false;
        state.proposedOwner = address(0);
        state.approvals = 0;
        // round persists to prevent reuse of previous approvals
    }
}
