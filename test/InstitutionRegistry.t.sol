// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";

import {InstitutionRegistry, ICertificateRegistry} from "../src/InstitutionRegistry.sol";

contract CertificateRegistryStub is ICertificateRegistry {
    address public lastInstitution;

    function authorizeInstitutionFromRegistry(address institution) external override {
        lastInstitution = institution;
    }
}

contract InstitutionRegistryTest is Test {
    InstitutionRegistry internal registry;
    CertificateRegistryStub internal certificateRegistry;

    address internal admin = address(1);
    address internal institution = address(2);

    function setUp() public {
        vm.prank(admin);
        registry = new InstitutionRegistry(admin);
        certificateRegistry = new CertificateRegistryStub();

        vm.prank(admin);
        registry.setCertificateRegistry(address(certificateRegistry));
    }

    function test_RegisterInstitution_Success() public {
        vm.prank(institution);
        registry.registerInstitution("Test University", "logo", "contact");

        InstitutionRegistry.Institution memory info = registry.getInstitution(institution);
        assertEq(info.name, "Test University");
        assertEq(info.logoIpfsHash, "logo");
        assertEq(info.contactInfo, "contact");
        assertEq(info.totalCertificatesIssued, 0);
        assertEq(info.verified, false);
    }

    function test_RegisterInstitution_RevertWhenDuplicate() public {
        vm.prank(institution);
        registry.registerInstitution("Test University", "logo", "contact");

        vm.prank(institution);
        vm.expectRevert(abi.encodeWithSelector(InstitutionRegistry.InstitutionAlreadyRegistered.selector, institution));
        registry.registerInstitution("Test University", "logo", "contact");
    }

    function test_VerifyInstitution_SetsFlagAndNotifiesCertificateRegistry() public {
        vm.prank(institution);
        registry.registerInstitution("Test University", "logo", "contact");

        vm.prank(admin);
        registry.verifyInstitution(institution);

        assertTrue(registry.verifiedInstitutions(institution));
        assertEq(certificateRegistry.lastInstitution(), institution);
    }

    function test_VerifyInstitution_RevertWhenNotRegistered() public {
        vm.prank(admin);
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

    function test_IncrementCertificateCount_RequiresRole() public {
        vm.prank(institution);
        registry.registerInstitution("Test University", "logo", "contact");

        vm.startPrank(admin);
        registry.grantRole(registry.REGISTRY_ROLE(), address(this));
        vm.stopPrank();

        registry.incrementCertificateCount(institution);

        InstitutionRegistry.Institution memory info = registry.getInstitution(institution);
        assertEq(info.totalCertificatesIssued, 1);
    }
}
