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
        institutionRegistry = new InstitutionRegistry(admin);
        templateManager = new TemplateManager(admin);
        registry = new CertificateRegistry(address(institutionRegistry), admin, "ipfs://base/");

        registry.setTemplateManager(address(templateManager));

        vm.prank(issuer);
        institutionRegistry.registerInstitution("Issuer", "logo", "contact");

        assertTrue(institutionRegistry.verifiedInstitutions(issuer));
    }

    function _createTemplate(address creator, string memory hash) internal returns (uint256 templateId) {
        vm.prank(creator);
        templateId = templateManager.createTemplate(hash, true, "Hackathon");
    }

    function test_IssueCertificate_Success() public {
        vm.prank(issuer);
        uint256 certificateId = registry.issueCertificate(recipient, "ipfs://Qm123", "Hackathon");

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

        assertEq(storedHash, "ipfs://Qm123");
        assertEq(storedIssuer, issuer);
        assertEq(storedRecipient, recipient);
        assertEq(storedType, "Hackathon");
        assertGt(issuedAt, 0);
        assertFalse(revoked);
    }

    function test_UriReturnsStoredHash() public {
        vm.prank(issuer);
        uint256 certificateId = registry.issueCertificate(recipient, "ipfs://uriHash", "Hackathon");

        assertEq(registry.uri(certificateId), "ipfs://uriHash");
    }

    function test_IssueCertificateWithTemplate_Success() public {
        uint256 templateId = _createTemplate(issuer, "ipfs://template");

        vm.prank(issuer);
        uint256 certificateId =
            registry.issueCertificateWithTemplate(recipient, "ipfs://QmTemplate", "Course", templateId);

        assertEq(registry.certificateTemplates(certificateId), templateId);

        TemplateManager.Template memory tpl = templateManager.getTemplate(templateId);
        assertEq(tpl.usageCount, 1);
    }

    function test_BatchIssueCertificates_Success() public {
        address[] memory recipients = new address[](2);
        recipients[0] = recipient;
        recipients[1] = other;

        string[] memory hashes = new string[](2);
        hashes[0] = "ipfs://Qm1";
        hashes[1] = "ipfs://Qm2";

        vm.prank(issuer);
        uint256[] memory ids = registry.batchIssueCertificates(recipients, hashes, "Hackathon");

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
        hashes[0] = "ipfs://Qa";
        hashes[1] = "ipfs://Qb";

        uint256[] memory templates = new uint256[](2);
        templates[0] = templateA;
        templates[1] = templateB;

        vm.prank(issuer);
        uint256[] memory ids = registry.batchIssueCertificatesWithTemplates(recipients, hashes, "Course", templates);

        assertEq(registry.certificateTemplates(ids[0]), templateA);
        assertEq(registry.certificateTemplates(ids[1]), templateB);

        TemplateManager.Template memory tplA = templateManager.getTemplate(templateA);
        TemplateManager.Template memory tplB = templateManager.getTemplate(templateB);
        assertEq(tplA.usageCount, 1);
        assertEq(tplB.usageCount, 1);
    }

    function test_RevokeCertificate_Success() public {
        vm.prank(issuer);
        uint256 certificateId = registry.issueCertificate(recipient, "ipfs://Qm123", "Hackathon");

        vm.prank(issuer);
        registry.revokeCertificate(certificateId);

        (,,,,, bool revoked) = registry.certificates(certificateId);
        assertTrue(revoked);
        assertTrue(registry.revokedCertificates(certificateId));
    }

    function test_RevokeCertificate_RevertWhenNotIssuer() public {
        vm.prank(issuer);
        uint256 certificateId = registry.issueCertificate(recipient, "ipfs://Qm123", "Hackathon");

        vm.prank(other);
        institutionRegistry.registerInstitution("Alt Issuer", "logo3", "contact3");

        vm.prank(other);
        vm.expectRevert(abi.encodeWithSelector(CertificateRegistry.NotCertificateIssuer.selector, certificateId, other));
        registry.revokeCertificate(certificateId);
    }

    function test_IssueCertificate_RevertWhenNotAuthorized() public {
        vm.expectRevert(abi.encodeWithSelector(CertificateRegistry.InstitutionNotVerified.selector, unverified));
        vm.prank(unverified);
        registry.issueCertificate(recipient, "ipfs://Qm123", "Hackathon");
    }

    function test_GetCertificatesByInstitution_ReturnsIds() public {
        vm.prank(issuer);
        registry.issueCertificate(recipient, "ipfs://Qm1", "Hackathon");
        vm.prank(issuer);
        registry.issueCertificate(other, "ipfs://Qm2", "Hackathon");

        uint256[] memory ids = registry.getCertificatesByInstitution(issuer);
        assertEq(ids.length, 2);
        assertEq(ids[0], 1);
        assertEq(ids[1], 2);
    }

    function test_GetCertificatesByRecipient_ReturnsIds() public {
        vm.prank(issuer);
        registry.issueCertificate(recipient, "ipfs://Qm1", "Hackathon");
        vm.prank(issuer);
        registry.issueCertificate(recipient, "ipfs://Qm2", "Hackathon");

        uint256[] memory ids = registry.getCertificatesByRecipient(recipient);
        assertEq(ids.length, 2);
        assertEq(ids[0], 1);
        assertEq(ids[1], 2);
    }

    function test_TransfersDisabled() public {
        vm.prank(issuer);
        uint256 certificateId = registry.issueCertificate(recipient, "ipfs://Qm123", "Hackathon");

        vm.prank(recipient);
        vm.expectRevert(CertificateRegistry.TransfersDisabled.selector);
        registry.safeTransferFrom(recipient, other, certificateId, 1, "");

        vm.prank(recipient);
        vm.expectRevert(CertificateRegistry.TransfersDisabled.selector);
        registry.setApprovalForAll(other, true);
    }
}
