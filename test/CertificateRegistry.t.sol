// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";

import {CertificateRegistry} from "../src/CertificateRegistry.sol";
import {InstitutionRegistry} from "../src/InstitutionRegistry.sol";
import {TemplateManager} from "../src/TemplateManager.sol";

contract CertificateRegistryTest is Test {
    CertificateRegistry internal registry;
    InstitutionRegistry internal institutionRegistry;
    TemplateManager internal templateManager;

    address internal admin = address(1);
    address internal issuer = address(2);
    address internal recipient = address(3);
    address internal other = address(4);
    address internal unverified = address(5);

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

        vm.prank(issuer);
        institutionRegistry.registerInstitution("Issuer", "logo", "contact");
        vm.prank(unverified);
        institutionRegistry.registerInstitution("Other", "logo2", "contact2");

        vm.prank(admin);
        institutionRegistry.verifyInstitution(issuer);

        assertTrue(registry.authorizedInstitutions(issuer));
        assertTrue(registry.hasRole(registry.ISSUER_ROLE(), issuer));
    }

    function _createTemplate(
        address creator,
        string memory hash
    ) internal returns (uint256 templateId) {
        vm.prank(creator);
        templateId = templateManager.createTemplate(hash, true, "Hackathon");
    }

    function test_IssueCertificate_Success() public {
        vm.prank(issuer);
        uint256 certificateId = registry.issueCertificate(
            recipient,
            "Qm123",
            "Hackathon"
        );

        assertEq(certificateId, 1);
        assertEq(registry.balanceOf(recipient, certificateId), 1);

        (
            string memory storedHash,
            address storedIssuer,
            address storedRecipient,
            uint256 issuedAt,
            string memory storedType,
            bool revoked
        ) = registry.certificates(certificateId);

        assertEq(storedHash, "Qm123");
        assertEq(storedIssuer, issuer);
        assertEq(storedRecipient, recipient);
        assertEq(storedType, "Hackathon");
        assertGt(issuedAt, 0);
        assertFalse(revoked);
    }

    function test_IssueCertificateWithTemplate_Success() public {
        uint256 templateId = _createTemplate(issuer, "ipfs://template");

        vm.prank(issuer);
        uint256 certificateId = registry.issueCertificateWithTemplate(
            recipient,
            "QmTemplate",
            "Course",
            templateId
        );

        assertEq(registry.certificateTemplates(certificateId), templateId);

        TemplateManager.Template memory tpl = templateManager.getTemplate(
            templateId
        );
        assertEq(tpl.usageCount, 1);
    }

    function test_BatchIssueCertificates_Success() public {
        address[] memory recipients = new address[](2);
        recipients[0] = recipient;
        recipients[1] = other;

        string[] memory hashes = new string[](2);
        hashes[0] = "Qm1";
        hashes[1] = "Qm2";

        vm.prank(issuer);
        uint256[] memory ids = registry.batchIssueCertificates(
            recipients,
            hashes,
            "Hackathon"
        );

        assertEq(ids.length, 2);
        assertEq(registry.balanceOf(recipient, ids[0]), 1);
        assertEq(registry.balanceOf(other, ids[1]), 1);
    }

    function test_BatchIssueCertificatesWithTemplates_Success() public {
        uint256 templateA = _createTemplate(issuer, "ipfs://a");
        uint256 templateB = _createTemplate(issuer, "ipfs://b");

        address[] memory recipients = new address[](2);
        recipients[0] = recipient;
        recipients[1] = other;

        string[] memory hashes = new string[](2);
        hashes[0] = "Qa";
        hashes[1] = "Qb";

        uint256[] memory templates = new uint256[](2);
        templates[0] = templateA;
        templates[1] = templateB;

        vm.prank(issuer);
        uint256[] memory ids = registry.batchIssueCertificatesWithTemplates(
            recipients,
            hashes,
            "Course",
            templates
        );

        assertEq(registry.certificateTemplates(ids[0]), templateA);
        assertEq(registry.certificateTemplates(ids[1]), templateB);

        TemplateManager.Template memory tplA = templateManager.getTemplate(
            templateA
        );
        TemplateManager.Template memory tplB = templateManager.getTemplate(
            templateB
        );
        assertEq(tplA.usageCount, 1);
        assertEq(tplB.usageCount, 1);
    }

    function test_RevokeCertificate_Success() public {
        vm.prank(issuer);
        uint256 certificateId = registry.issueCertificate(
            recipient,
            "Qm123",
            "Hackathon"
        );

        vm.prank(issuer);
        registry.revokeCertificate(certificateId);

        (, , , , , bool revoked) = registry.certificates(certificateId);
        assertTrue(revoked);
        assertTrue(registry.revokedCertificates(certificateId));
    }

    function test_RevokeCertificate_RevertWhenNotIssuer() public {
        vm.prank(issuer);
        uint256 certificateId = registry.issueCertificate(
            recipient,
            "Qm123",
            "Hackathon"
        );

        vm.prank(other);
        institutionRegistry.registerInstitution(
            "Alt Issuer",
            "logo3",
            "contact3"
        );
        vm.prank(admin);
        institutionRegistry.verifyInstitution(other);

        vm.prank(other);
        vm.expectRevert(
            abi.encodeWithSelector(
                CertificateRegistry.NotCertificateIssuer.selector,
                certificateId,
                other
            )
        );
        registry.revokeCertificate(certificateId);
    }

    function test_IssueCertificate_RevertWhenNotAuthorized() public {
        vm.prank(unverified);
        vm.expectRevert();
        registry.issueCertificate(recipient, "Qm123", "Hackathon");
    }

    function test_AuthorizeInstitution_RevertWhenNotVerified() public {
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(
                CertificateRegistry.InstitutionNotVerified.selector,
                unverified
            )
        );
        registry.authorizeInstitution(unverified);
    }

    function test_GetCertificatesByInstitution_ReturnsIds() public {
        vm.prank(issuer);
        registry.issueCertificate(recipient, "Qm1", "Hackathon");
        vm.prank(issuer);
        registry.issueCertificate(other, "Qm2", "Hackathon");

        uint256[] memory ids = registry.getCertificatesByInstitution(issuer);
        assertEq(ids.length, 2);
        assertEq(ids[0], 1);
        assertEq(ids[1], 2);
    }

    function test_GetCertificatesByRecipient_ReturnsIds() public {
        vm.prank(issuer);
        registry.issueCertificate(recipient, "Qm1", "Hackathon");
        vm.prank(issuer);
        registry.issueCertificate(recipient, "Qm2", "Hackathon");

        uint256[] memory ids = registry.getCertificatesByRecipient(recipient);
        assertEq(ids.length, 2);
        assertEq(ids[0], 1);
        assertEq(ids[1], 2);
    }

    function test_PauseBlocksIssuance() public {
        vm.prank(admin);
        registry.pause();

        vm.prank(issuer);
        vm.expectRevert(bytes4(keccak256("EnforcedPause()")));
        registry.issueCertificate(recipient, "Qm123", "Hackathon");
    }
}
