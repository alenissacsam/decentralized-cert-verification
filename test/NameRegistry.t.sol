// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";

import {NameRegistry} from "../src/NameRegistry.sol";

contract NameRegistryTest is Test {
    NameRegistry internal registry;
    address internal alice = address(1);

    function setUp() public {
        registry = new NameRegistry();
    }

    function test_SetNameAndReadBack() public {
        vm.prank(alice);
        registry.setName("Alice Example");

        string memory stored = registry.getName(alice);
        assertEq(stored, "Alice Example");
    }

    function test_SetNameRevertWhenEmpty() public {
        vm.prank(alice);
        vm.expectRevert(NameRegistry.EmptyName.selector);
        registry.setName("");
    }

    function test_ClearName() public {
        vm.prank(alice);
        registry.setName("Alice Example");

        vm.prank(alice);
        registry.clearName();

        string memory stored = registry.getName(alice);
        assertEq(stored, "");
    }
}
