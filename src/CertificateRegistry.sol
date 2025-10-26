// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {IInstitutionRegistry} from "./interfaces/IInstitutionRegistry.sol";
import {ITemplateManager} from "./interfaces/ITemplateManager.sol";

/**
 * @title CertificateRegistry
 * @notice ERC-1155 based registry for issuing and managing certificates.
 */
contract CertificateRegistry is ERC1155, ReentrancyGuard {
    address public immutable deployer;

    struct Certificate {
        string ipfsHash;
        address issuer;
        address recipient;
        uint256 issuedAt;
        string certificateType;
        bool revoked;
    }

    uint256 public certificateCounter;

    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) private _institutionCertificates;
    mapping(address => uint256[]) private _recipientCertificates;
    mapping(uint256 => uint256) public certificateTemplates;
    mapping(uint256 => bool) public revokedCertificates;

    IInstitutionRegistry public immutable institutionRegistry;
    ITemplateManager public templateManager;

    event CertificateIssued(
        uint256 indexed certificateId,
        address indexed issuer,
        address indexed recipient,
        string ipfsHash
    );
    event BatchCertificateIssued(
        uint256[] certificateIds,
        address indexed issuer,
        address[] recipients
    );
    event CertificateRevoked(
        uint256 indexed certificateId,
        address indexed issuer
    );
    event TemplateManagerSet(address indexed templateManager);
    event CertificateTemplateLinked(
        uint256 indexed certificateId,
        uint256 indexed templateId
    );

    error ZeroAddress();
    error EmptyField();
    error CertificateNotFound(uint256 certificateId);
    error NotCertificateIssuer(uint256 certificateId, address caller);
    error AlreadyRevoked(uint256 certificateId);
    error InstitutionNotVerified(address institution);
    error TransfersDisabled();

    constructor(
        address institutionRegistry_,
        address admin,
        string memory baseUri
    ) ERC1155(baseUri) {
        if (institutionRegistry_ == address(0) || admin == address(0))
            revert ZeroAddress();

        institutionRegistry = IInstitutionRegistry(institutionRegistry_);
        deployer = admin;
    }

    /**
     * @notice Sets the template manager contract used for tracking template usage.
     * @param templateManager_ Address of the template manager contract.
     */
    function setTemplateManager(address templateManager_) external {
        if (templateManager_ == address(0)) revert ZeroAddress();
        templateManager = ITemplateManager(templateManager_);
        emit TemplateManagerSet(templateManager_);
    }

    /**
     * @notice Issues a new certificate.
     * @param recipient Recipient wallet address.
     * @param ipfsHash IPFS CID for metadata.
     * @param certificateType Informational classification.
     * @return certificateId Newly minted certificate identifier.
     */
    function issueCertificate(
        address recipient,
        string calldata ipfsHash,
        string calldata certificateType
    ) external nonReentrant returns (uint256 certificateId) {
        if (recipient == address(0)) revert ZeroAddress();
        if (bytes(ipfsHash).length == 0 || bytes(certificateType).length == 0)
            revert EmptyField();
        address issuer = _msgSender();
        if (!institutionRegistry.verifiedInstitutions(issuer)) {
            revert InstitutionNotVerified(issuer);
        }

        certificateId = _issueCertificateInternal(
            issuer,
            recipient,
            ipfsHash,
            certificateType
        );

        emit CertificateIssued(certificateId, issuer, recipient, ipfsHash);
    }

    /**
     * @notice Issues a certificate and associates it with a template.
     * @param recipient Recipient wallet address.
     * @param ipfsHash IPFS CID for metadata.
     * @param certificateType Informational classification.
     * @param templateId Template identifier in TemplateManager.
     * @return certificateId Newly minted certificate identifier.
     */
    function issueCertificateWithTemplate(
        address recipient,
        string calldata ipfsHash,
        string calldata certificateType,
        uint256 templateId
    ) external nonReentrant returns (uint256 certificateId) {
        if (recipient == address(0)) revert ZeroAddress();
        if (bytes(ipfsHash).length == 0 || bytes(certificateType).length == 0)
            revert EmptyField();
        address issuer = _msgSender();
        if (!institutionRegistry.verifiedInstitutions(issuer)) {
            revert InstitutionNotVerified(issuer);
        }

        certificateId = _issueCertificateInternal(
            issuer,
            recipient,
            ipfsHash,
            certificateType
        );
        emit CertificateIssued(certificateId, issuer, recipient, ipfsHash);
        _linkTemplate(certificateId, templateId);
    }

    /**
     * @notice Issues multiple certificates in a batch.
     * @param recipients Array of recipients.
     * @param ipfsHashes Array of IPFS hashes corresponding to certificates.
     * @param certificateType Shared classification for certificates.
     * @return certificateIds Newly minted certificate identifiers.
     */
    function batchIssueCertificates(
        address[] calldata recipients,
        string[] calldata ipfsHashes,
        string calldata certificateType
    ) external nonReentrant returns (uint256[] memory certificateIds) {
        uint256 length = recipients.length;
        if (length == 0 || length != ipfsHashes.length) revert EmptyField();
        if (bytes(certificateType).length == 0) revert EmptyField();
        address issuer = _msgSender();
        if (!institutionRegistry.verifiedInstitutions(issuer)) {
            revert InstitutionNotVerified(issuer);
        }

        certificateIds = new uint256[](length);

        for (uint256 i = 0; i < length; ) {
            address recipient = recipients[i];
            if (recipient == address(0)) revert ZeroAddress();

            string memory hash = ipfsHashes[i];
            if (bytes(hash).length == 0) revert EmptyField();

            uint256 certId = _issueCertificateInternal(
                issuer,
                recipient,
                hash,
                certificateType
            );
            certificateIds[i] = certId;

            emit CertificateIssued(certId, issuer, recipient, hash);

            unchecked {
                ++i;
            }
        }

        emit BatchCertificateIssued(certificateIds, issuer, recipients);
    }

    function batchIssueCertificatesWithTemplates(
        address[] calldata recipients,
        string[] calldata ipfsHashes,
        string calldata certificateType,
        uint256[] calldata templateIds
    ) external nonReentrant returns (uint256[] memory certificateIds) {
        uint256 length = recipients.length;
        if (
            length == 0 ||
            length != ipfsHashes.length ||
            length != templateIds.length
        ) {
            revert EmptyField();
        }
        if (bytes(certificateType).length == 0) revert EmptyField();
        address issuer = _msgSender();
        if (!institutionRegistry.verifiedInstitutions(issuer)) {
            revert InstitutionNotVerified(issuer);
        }

        certificateIds = new uint256[](length);

        for (uint256 i = 0; i < length; ) {
            address recipient = recipients[i];
            if (recipient == address(0)) revert ZeroAddress();

            string memory hash = ipfsHashes[i];
            if (bytes(hash).length == 0) revert EmptyField();

            uint256 certId = _issueCertificateInternal(
                issuer,
                recipient,
                hash,
                certificateType
            );
            certificateIds[i] = certId;

            emit CertificateIssued(certId, issuer, recipient, hash);
            _linkTemplate(certId, templateIds[i]);

            unchecked {
                ++i;
            }
        }

        emit BatchCertificateIssued(certificateIds, issuer, recipients);
    }

    /**
     * @notice Returns certificate metadata for verification.
     * @param certificateId Certificate identifier.
     */
    function verifyCertificate(
        uint256 certificateId
    ) external view returns (Certificate memory) {
        Certificate memory cert = certificates[certificateId];
        if (cert.issuedAt == 0) revert CertificateNotFound(certificateId);
        return cert;
    }

    /**
     * @notice Revokes an issued certificate without burning the token.
     * @param certificateId Target certificate identifier.
     */
    function revokeCertificate(uint256 certificateId) external {
        Certificate storage cert = certificates[certificateId];
        if (cert.issuedAt == 0) revert CertificateNotFound(certificateId);
        if (cert.issuer != _msgSender())
            revert NotCertificateIssuer(certificateId, _msgSender());
        if (cert.revoked) revert AlreadyRevoked(certificateId);

        cert.revoked = true;
        revokedCertificates[certificateId] = true;

        emit CertificateRevoked(certificateId, _msgSender());
    }

    /**
     * @notice Fetches certificate identifiers issued by a specific institution.
     * @param institution Institution address.
     */
    function getCertificatesByInstitution(
        address institution
    ) external view returns (uint256[] memory) {
        if (institution == address(0)) revert ZeroAddress();
        uint256[] storage stored = _institutionCertificates[institution];
        uint256 length = stored.length;
        uint256[] memory certIds = new uint256[](length);
        for (uint256 i = 0; i < length; ) {
            certIds[i] = stored[i];
            unchecked {
                ++i;
            }
        }
        return certIds;
    }

    /**
     * @notice Fetches certificate identifiers held by a recipient wallet.
     * @param recipient Recipient address.
     */
    function getCertificatesByRecipient(
        address recipient
    ) external view returns (uint256[] memory) {
        if (recipient == address(0)) revert ZeroAddress();
        uint256[] storage stored = _recipientCertificates[recipient];
        uint256 length = stored.length;
        uint256[] memory certIds = new uint256[](length);
        for (uint256 i = 0; i < length; ) {
            certIds[i] = stored[i];
            unchecked {
                ++i;
            }
        }
        return certIds;
    }

    function uri(
        uint256 certificateId
    ) public view override returns (string memory) {
        Certificate memory cert = certificates[certificateId];
        if (cert.issuedAt == 0) revert CertificateNotFound(certificateId);

        string memory stored = cert.ipfsHash;
        if (_hasProtocolPrefix(stored)) {
            return stored;
        }

        string memory base = super.uri(certificateId);
        if (bytes(base).length == 0) {
            return stored;
        }

        return string(abi.encodePacked(base, stored));
    }

    function safeTransferFrom(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public pure override {
        revert TransfersDisabled();
    }

    function safeBatchTransferFrom(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public pure override {
        revert TransfersDisabled();
    }

    function setApprovalForAll(address, bool) public pure override {
        revert TransfersDisabled();
    }

    function _issueCertificateInternal(
        address issuer,
        address recipient,
        string memory ipfsHash,
        string memory certificateType
    ) private returns (uint256 certificateId) {
        certificateId = ++certificateCounter;
        certificates[certificateId] = Certificate({
            ipfsHash: ipfsHash,
            issuer: issuer,
            recipient: recipient,
            issuedAt: block.timestamp,
            certificateType: certificateType,
            revoked: false
        });

        _institutionCertificates[issuer].push(certificateId);
        _recipientCertificates[recipient].push(certificateId);

        _mint(recipient, certificateId, 1, "");
        institutionRegistry.incrementCertificateCount(issuer);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override {
        if (from != address(0) && to != address(0)) {
            revert TransfersDisabled();
        }

        super._update(from, to, ids, values);
    }

    function _linkTemplate(uint256 certificateId, uint256 templateId) private {
        if (templateId == 0) {
            return;
        }
        if (address(templateManager) == address(0)) revert ZeroAddress();
        certificateTemplates[certificateId] = templateId;
        templateManager.incrementUsageCount(templateId);
        emit CertificateTemplateLinked(certificateId, templateId);
    }

    function _hasProtocolPrefix(
        string memory value
    ) private pure returns (bool) {
        bytes memory data = bytes(value);
        if (data.length < 7) {
            return false;
        }

        if (
            data[0] == "i" &&
            data[1] == "p" &&
            data[2] == "f" &&
            data[3] == "s" &&
            data[4] == ":" &&
            data[5] == "/" &&
            data[6] == "/"
        ) {
            return true;
        }

        if (data.length < 8) {
            return false;
        }

        return
            data[0] == "h" &&
            data[1] == "t" &&
            data[2] == "t" &&
            data[3] == "p" &&
            data[4] == "s" &&
            data[5] == ":" &&
            data[6] == "/" &&
            data[7] == "/";
    }
}
