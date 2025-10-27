// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";

import {GuardianAccount} from "../src/GuardianAccount.sol";
import {GuardianRecovery} from "../src/GuardianRecovery.sol";

contract CallReceiver {
    uint256 public storedValue;

    event ValueChanged(uint256 newValue);

    function setValue(uint256 value) external {
        storedValue = value;
        emit ValueChanged(value);
    }
}

contract GuardianAccountTest is Test {
    GuardianAccount private account;
    GuardianRecovery private recovery;
    CallReceiver private receiver;

    address private owner = address(0xA11CE);
    address private guardian1 = address(0xBEEF);
    address private guardian2 = address(0xDEAD);
    address private guardian3 = address(0xCAFE);
    address private newOwner = address(0xFEED);

    function setUp() external {
        vm.deal(owner, 10 ether);

        account = new GuardianAccount(owner);
        recovery = new GuardianRecovery();
        receiver = new CallReceiver();

        vm.prank(owner);
        account.setGuardianModule(address(recovery));

        address[] memory guardians = new address[](3);
        guardians[0] = guardian1;
        guardians[1] = guardian2;
        guardians[2] = guardian3;

        bytes memory configureData = abi.encodeWithSelector(
            GuardianRecovery.configureGuardians.selector,
            guardians,
            2
        );

        vm.prank(owner);
        account.execute(address(recovery), 0, configureData);
    }

    function testExecuteUpdatesReceiver() external {
        bytes memory callData = abi.encodeWithSelector(
            CallReceiver.setValue.selector,
            123
        );

        vm.prank(owner);
        account.execute(address(receiver), 0, callData);

        assertEq(receiver.storedValue(), 123);
    }

    function testGuardianRecoveryHappyPath() external {
        vm.prank(guardian1);
        recovery.initiateRecovery(address(account), newOwner);

        vm.prank(guardian2);
        recovery.approveRecovery(address(account));

        assertEq(account.owner(), newOwner);
    }

    function testGuardianCannotApproveTwice() external {
        vm.prank(guardian1);
        recovery.initiateRecovery(address(account), newOwner);

        vm.expectRevert(
            abi.encodeWithSelector(
                GuardianRecovery.AlreadyApproved.selector,
                address(account),
                guardian1
            )
        );
        vm.prank(guardian1);
        recovery.approveRecovery(address(account));
    }

    function testCancelRecoveryViaAccount() external {
        vm.prank(guardian1);
        recovery.initiateRecovery(address(account), newOwner);

        bytes memory cancelData = abi.encodeWithSelector(
            GuardianRecovery.cancelRecovery.selector,
            address(account)
        );

        vm.prank(owner);
        account.execute(address(recovery), 0, cancelData);

        (bool active, , , ) = recovery.getRecoveryState(address(account));
        assertFalse(active);
    }

    function testReconfigureGuardiansResetsRecovery() external {
        vm.prank(guardian1);
        recovery.initiateRecovery(address(account), newOwner);

        address[] memory newGuardians = new address[](2);
        newGuardians[0] = guardian1;
        newGuardians[1] = guardian2;

        bytes memory configureData = abi.encodeWithSelector(
            GuardianRecovery.configureGuardians.selector,
            newGuardians,
            2
        );

        vm.prank(owner);
        account.execute(address(recovery), 0, configureData);

        (bool active, , , ) = recovery.getRecoveryState(address(account));
        assertFalse(active);
    }
}
