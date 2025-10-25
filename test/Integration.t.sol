// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";

import {CertificateRegistry} from "../src/CertificateRegistry.sol";
import {InstitutionRegistry} from "../src/InstitutionRegistry.sol";
import {TemplateManager} from "../src/TemplateManager.sol";

contract IntegrationTest is Test {
    CertificateRegistry internal registry;
    InstitutionRegistry internal institutionRegistry;
    TemplateManager internal templateManager;

    address internal admin = address(1);
    address internal issuer = address(2);
    address internal recipient = address(3);

    function setUp() public {
        vm.prank(admin);
        institutionRegistry = new InstitutionRegistry(admin);

        vm.prank(admin);
        templateManager = new TemplateManager(admin);

        vm.prank(admin);
        registry = new CertificateRegistry(
            address(institutionRegistry),
            admin,
            "ipfs://base/"
        );

        vm.startPrank(admin);
        institutionRegistry.setCertificateRegistry(address(registry));
        institutionRegistry.grantRole(
            institutionRegistry.REGISTRY_ROLE(),
            address(registry)
        );
        registry.grantRole(
            registry.REGISTRY_ROLE(),
            address(institutionRegistry)
        );
        templateManager.grantRole(
            templateManager.REGISTRY_ROLE(),
            address(registry)
        );
        templateManager.grantIssuerRole(issuer);
        registry.setTemplateManager(address(templateManager));
        vm.stopPrank();
    }

    function test_EndToEndLifecycle() public {
        vm.prank(issuer);
        institutionRegistry.registerInstitution(
            "Integration Uni",
            "logo",
            "contact"
        );

        vm.prank(admin);
        institutionRegistry.verifyInstitution(issuer);

        vm.prank(issuer);
        uint256 templateId = templateManager.createTemplate(
            "ipfs://template",
            true,
            "Hackathon"
        );

        vm.prank(issuer);
        uint256 certificateId = registry.issueCertificateWithTemplate(
            recipient,
            "QmIntegration",
            "Hackathon",
            templateId
        );

        assertEq(registry.balanceOf(recipient, certificateId), 1);

        InstitutionRegistry.Institution memory info = institutionRegistry
            .getInstitution(issuer);
        assertEq(info.totalCertificatesIssued, 1);

        TemplateManager.Template memory tpl = templateManager.getTemplate(
            templateId
        );
        assertEq(tpl.usageCount, 1);

        CertificateRegistry.Certificate memory cert = registry
            .verifyCertificate(certificateId);
        assertEq(cert.recipient, recipient);
        assertEq(cert.issuer, issuer);
        assertFalse(cert.revoked);
    }
}
