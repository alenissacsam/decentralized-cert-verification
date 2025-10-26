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
        institutionRegistry = new InstitutionRegistry(admin);
        templateManager = new TemplateManager(admin);
        registry = new CertificateRegistry(
            address(institutionRegistry),
            admin,
            "ipfs://base/"
        );

        registry.setTemplateManager(address(templateManager));
    }

    function test_EndToEndLifecycle() public {
        vm.prank(issuer);
        institutionRegistry.registerInstitution(
            "Integration Uni",
            "logo",
            "contact"
        );

        vm.prank(issuer);
        uint256 templateId = templateManager.createTemplate(
            "ipfs://template",
            true,
            "Hackathon"
        );

        vm.prank(issuer);
        uint256 certificateId = registry.issueCertificateWithTemplate(
            recipient,
            "ipfs://QmIntegration",
            "Hackathon",
            templateId
        );

        assertEq(registry.balanceOf(recipient, certificateId), 1);
        assertEq(registry.uri(certificateId), "ipfs://QmIntegration");

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
