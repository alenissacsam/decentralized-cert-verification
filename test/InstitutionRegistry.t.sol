// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";

import {InstitutionRegistry} from "../src/InstitutionRegistry.sol";

contract InstitutionRegistryTest is Test {
    InstitutionRegistry internal registry;

    address internal admin = address(1);
    address internal institution = address(2);

    function setUp() public {
        registry = new InstitutionRegistry(admin);
    }

    function test_RegisterInstitution_Success() public {
        vm.prank(institution);
        registry.registerInstitution("Test University", "logo", "contact");

        InstitutionRegistry.Institution memory info = registry.getInstitution(institution);
        assertEq(info.name, "Test University");
        assertEq(info.logoIpfsHash, "logo");
        assertEq(info.contactInfo, "contact");
        assertEq(info.totalCertificatesIssued, 0);
        assertTrue(info.verified);
        assertTrue(registry.verifiedInstitutions(institution));
    }

    function test_RegisterInstitution_RevertWhenDuplicate() public {
        vm.prank(institution);
        registry.registerInstitution("Test University", "logo", "contact");

        vm.prank(institution);
        vm.expectRevert(abi.encodeWithSelector(InstitutionRegistry.InstitutionAlreadyRegistered.selector, institution));
        registry.registerInstitution("Test University", "logo", "contact");
    }

    function test_VerifyInstitution_RevertWhenAlreadyVerified() public {
        vm.prank(institution);
        registry.registerInstitution("Test University", "logo", "contact");

        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(InstitutionRegistry.InstitutionAlreadyVerified.selector, institution));
        registry.verifyInstitution(institution);
    }

    function test_VerifyInstitution_RevertWhenNotRegistered() public {
        vm.expectRevert(abi.encodeWithSelector(InstitutionRegistry.InstitutionNotRegistered.selector, institution));
        registry.verifyInstitution(institution);
    }

    function test_UpdateInstitutionInfo_Success() public {
        vm.prank(institution);
        registry.registerInstitution("Test University", "logo", "contact");

        vm.prank(institution);
        registry.updateInstitutionInfo("newLogo", "newContact");

        InstitutionRegistry.Institution memory info = registry.getInstitution(institution);
        assertEq(info.logoIpfsHash, "newLogo");
        assertEq(info.contactInfo, "newContact");
    }

    function test_IncrementCertificateCount_IncreasesCounter() public {
        vm.prank(institution);
        registry.registerInstitution("Test University", "logo", "contact");

        registry.incrementCertificateCount(institution);

        InstitutionRegistry.Institution memory info = registry.getInstitution(institution);
        assertEq(info.totalCertificatesIssued, 1);
    }
}
