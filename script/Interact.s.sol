// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";

import {CertificateRegistry} from "../src/CertificateRegistry.sol";
import {InstitutionRegistry} from "../src/InstitutionRegistry.sol";
import {TemplateManager} from "../src/TemplateManager.sol";
import {NameRegistry} from "../src/NameRegistry.sol";

contract ContractInteractions is Script {
    InstitutionRegistry private institutionRegistry;
    TemplateManager private templateManager;
    CertificateRegistry private certificateRegistry;
    NameRegistry private nameRegistry;
    uint256 private callerPrivateKey;
    address private caller;

    modifier setUp() {
        callerPrivateKey = vm.envUint("CALLER_PRIVATE_KEY");
        caller = vm.addr(callerPrivateKey);
        institutionRegistry = InstitutionRegistry(
            vm.envAddress("INSTITUTION_REGISTRY_ADDRESS")
        );
        templateManager = TemplateManager(
            vm.envAddress("TEMPLATE_MANAGER_ADDRESS")
        );
        certificateRegistry = CertificateRegistry(
            vm.envAddress("CERTIFICATE_REGISTRY_ADDRESS")
        );
        nameRegistry = NameRegistry(vm.envAddress("NAME_REGISTRY_ADDRESS"));
        _;
    }

    function run() external pure {
        revert("Select a function using --sig");
    }

    function registerInstitution(
        string calldata name,
        string calldata logoIpfsHash,
        string calldata contactInfo
    ) external setUp {
        vm.startBroadcast(callerPrivateKey);
        institutionRegistry.registerInstitution(
            name,
            logoIpfsHash,
            contactInfo
        );
        vm.stopBroadcast();
        console2.log("Registered institution for", caller);
    }

    function createTemplate(
        string calldata ipfsHash,
        bool isPublic,
        string calldata category
    ) external setUp {
        vm.startBroadcast(callerPrivateKey);
        uint256 templateId = templateManager.createTemplate(
            ipfsHash,
            isPublic,
            category
        );
        vm.stopBroadcast();
        console2.log("Created template", templateId);
    }

    function issueCertificate(
        address recipient,
        string calldata ipfsHash,
        string calldata certificateType,
        uint256 templateId
    ) external setUp {
        vm.startBroadcast(callerPrivateKey);
        uint256 certificateId;
        if (templateId == 0) {
            certificateId = certificateRegistry.issueCertificate(
                recipient,
                ipfsHash,
                certificateType
            );
        } else {
            certificateId = certificateRegistry.issueCertificateWithTemplate(
                recipient,
                ipfsHash,
                certificateType,
                templateId
            );
        }
        vm.stopBroadcast();
        console2.log("Issued certificate", certificateId);
    }

    function setDisplayName(string calldata name) external setUp {
        vm.startBroadcast(callerPrivateKey);
        nameRegistry.setName(name);
        vm.stopBroadcast();
        console2.log("Set display name for", caller);
    }

    function clearDisplayName() external setUp {
        vm.startBroadcast(callerPrivateKey);
        nameRegistry.clearName();
        vm.stopBroadcast();
        console2.log("Cleared display name for", caller);
    }

    // ============ Write Functions - Certificates ============

    function revokeCertificate(uint256 certificateId) external setUp {
        vm.startBroadcast(callerPrivateKey);
        certificateRegistry.revokeCertificate(certificateId);
        vm.stopBroadcast();
        console2.log("Revoked certificate", certificateId);
    }

    function batchIssueCertificates(
        address[] calldata recipients,
        string[] calldata ipfsHashes,
        string calldata certificateType
    ) external setUp {
        vm.startBroadcast(callerPrivateKey);
        uint256[] memory certificateIds = certificateRegistry
            .batchIssueCertificates(recipients, ipfsHashes, certificateType);
        vm.stopBroadcast();
        console2.log("Batch issued", certificateIds.length, "certificates");
    }

    function batchIssueCertificatesWithTemplates(
        address[] calldata recipients,
        string[] calldata ipfsHashes,
        string calldata certificateType,
        uint256[] calldata templateIds
    ) external setUp {
        vm.startBroadcast(callerPrivateKey);
        uint256[] memory certificateIds = certificateRegistry
            .batchIssueCertificatesWithTemplates(
                recipients,
                ipfsHashes,
                certificateType,
                templateIds
            );
        vm.stopBroadcast();
        console2.log(
            "Batch issued",
            certificateIds.length,
            "certificates with templates"
        );
    }

    // ============ Write Functions - Institutions ============

    function updateInstitutionInfo(
        string calldata logoIpfsHash,
        string calldata contactInfo
    ) external setUp {
        vm.startBroadcast(callerPrivateKey);
        institutionRegistry.updateInstitutionInfo(logoIpfsHash, contactInfo);
        vm.stopBroadcast();
        console2.log("Updated institution info for", caller);
    }

    function verifyInstitution(address institution) external setUp {
        vm.startBroadcast(callerPrivateKey);
        institutionRegistry.verifyInstitution(institution);
        vm.stopBroadcast();
        console2.log("Verified institution", institution);
    }

    // ============ Read Functions - Certificates ============

    function verifyCertificate(uint256 certificateId) external setUp {
        CertificateRegistry.Certificate memory cert = certificateRegistry
            .verifyCertificate(certificateId);
        console2.log("Certificate ID:", certificateId);
        console2.log("Issuer:", cert.issuer);
        console2.log("Recipient:", cert.recipient);
        console2.log("Type:", cert.certificateType);
        console2.log("Revoked:", cert.revoked);
        console2.log("IPFS Hash:", cert.ipfsHash);
    }

    function getCertificatesByInstitution(address institution) external setUp {
        uint256[] memory certIds = certificateRegistry
            .getCertificatesByInstitution(institution);
        console2.log("Institution has certificates:", certIds.length);
        for (uint256 i = 0; i < certIds.length; i++) {
            console2.log("  Certificate ID:", certIds[i]);
        }
    }

    function getCertificatesByRecipient(address recipient) external setUp {
        uint256[] memory certIds = certificateRegistry
            .getCertificatesByRecipient(recipient);
        console2.log("Recipient holds certificates:", certIds.length);
        for (uint256 i = 0; i < certIds.length; i++) {
            console2.log("  Certificate ID:", certIds[i]);
        }
    }

    function getCertificateUri(uint256 certificateId) external setUp {
        string memory uri = certificateRegistry.uri(certificateId);
        console2.log("URI for certificate", certificateId);
        console2.log(uri);
    }

    // ============ Read Functions - Institutions ============

    function getInstitution(address institution) external setUp {
        InstitutionRegistry.Institution memory inst = institutionRegistry
            .getInstitution(institution);
        console2.log("Institution:", institution);
        console2.log("Name:", inst.name);
        console2.log("Contact:", inst.contactInfo);
        console2.log("Total Certificates:", inst.totalCertificatesIssued);
        console2.log("Verified:", inst.verified);
    }

    function institutionExists(address institution) external setUp {
        bool exists = institutionRegistry.institutionExists(institution);
        console2.log("Institution exists:", exists);
    }

    // ============ Read Functions - Templates ============

    function getTemplate(uint256 templateId) external setUp {
        TemplateManager.Template memory tmpl = templateManager.getTemplate(
            templateId
        );
        console2.log("Template ID:", templateId);
        console2.log("Creator:", tmpl.creator);
        console2.log("Public:", tmpl.isPublic);
        console2.log("Category:", tmpl.category);
        console2.log("Usage Count:", tmpl.usageCount);
        console2.log("IPFS Hash:", tmpl.ipfsHash);
    }

    function listPublicTemplates() external setUp {
        uint256[] memory templates = templateManager.listPublicTemplates();
        console2.log("Total public templates:", templates.length);
        for (uint256 i = 0; i < templates.length; i++) {
            console2.log("  Template ID:", templates[i]);
        }
    }

    function getInstitutionTemplates(address institution) external setUp {
        uint256[] memory templates = templateManager.getInstitutionTemplates(
            institution
        );
        console2.log("Institution created templates:", templates.length);
        for (uint256 i = 0; i < templates.length; i++) {
            console2.log("  Template ID:", templates[i]);
        }
    }

    // ============ Read Functions - Names ============

    function getDisplayName(address account) external setUp {
        string memory name = nameRegistry.getName(account);
        console2.log("Display name for", account);
        console2.log(name);
    }
}
