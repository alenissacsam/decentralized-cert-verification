// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {IInstitutionRegistry} from "./interfaces/IInstitutionRegistry.sol";
import {ITemplateManager} from "./interfaces/ITemplateManager.sol";

/**
 * @title CertificateRegistry
 * @notice ERC-1155 based registry for issuing and managing certificates.
 */
contract CertificateRegistry is
    ERC1155,
    AccessControl,
    Pausable,
    ReentrancyGuard
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant REGISTRY_ROLE = keccak256("REGISTRY_ROLE");

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
    mapping(address => bool) public authorizedInstitutions;
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
    event InstitutionAuthorized(address indexed institution);
    event InstitutionDeauthorized(address indexed institution);
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

    constructor(
        address institutionRegistry_,
        address admin,
        string memory baseUri
    ) ERC1155(baseUri) {
        if (institutionRegistry_ == address(0) || admin == address(0))
            revert ZeroAddress();

        institutionRegistry = IInstitutionRegistry(institutionRegistry_);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(ISSUER_ROLE, admin);
        _grantRole(REGISTRY_ROLE, admin);
    }

    /**
     * @notice Sets the template manager contract used for tracking template usage.
     * @param templateManager_ Address of the template manager contract.
     */
    function setTemplateManager(
        address templateManager_
    ) external onlyRole(ADMIN_ROLE) {
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
    )
        external
        nonReentrant
        whenNotPaused
        onlyRole(ISSUER_ROLE)
        returns (uint256 certificateId)
    {
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
    )
        external
        nonReentrant
        whenNotPaused
        onlyRole(ISSUER_ROLE)
        returns (uint256 certificateId)
    {
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
    )
        external
        nonReentrant
        whenNotPaused
        onlyRole(ISSUER_ROLE)
        returns (uint256[] memory certificateIds)
    {
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
            if (recipient == address(0) || bytes(ipfsHashes[i]).length == 0)
                revert EmptyField();

            uint256 certId = _issueCertificateInternal(
                issuer,
                recipient,
                ipfsHashes[i],
                certificateType
            );
            certificateIds[i] = certId;

            emit CertificateIssued(certId, issuer, recipient, ipfsHashes[i]);

            unchecked {
                ++i;
            }
        }

        emit BatchCertificateIssued(certificateIds, issuer, recipients);
    }

    /**
     * @notice Issues multiple certificates in a batch with associated templates.
     * @param recipients Array of recipients.
     * @param ipfsHashes Array of IPFS hashes corresponding to certificates.
     * @param certificateType Shared classification for certificates.
     * @param templateIds Template identifiers aligned with the certificates.
     * @return certificateIds Newly minted certificate identifiers.
     */
    function batchIssueCertificatesWithTemplates(
        address[] calldata recipients,
        string[] calldata ipfsHashes,
        string calldata certificateType,
        uint256[] calldata templateIds
    )
        external
        nonReentrant
        whenNotPaused
        onlyRole(ISSUER_ROLE)
        returns (uint256[] memory certificateIds)
    {
        if (
            recipients.length == 0 ||
            recipients.length != ipfsHashes.length ||
            recipients.length != templateIds.length
        ) {
            revert EmptyField();
        }
        if (bytes(certificateType).length == 0) revert EmptyField();
        if (!institutionRegistry.verifiedInstitutions(_msgSender())) {
            revert InstitutionNotVerified(_msgSender());
        }

        certificateIds = new uint256[](recipients.length);

        for (uint256 i = 0; i < recipients.length; ) {
            address currentRecipient = recipients[i];
            if (currentRecipient == address(0)) revert ZeroAddress();

            string memory currentHash = ipfsHashes[i];
            if (bytes(currentHash).length == 0) revert EmptyField();

            uint256 certId = _issueCertificateInternal(
                _msgSender(),
                currentRecipient,
                currentHash,
                certificateType
            );
            certificateIds[i] = certId;

            emit CertificateIssued(
                certId,
                _msgSender(),
                currentRecipient,
                currentHash
            );
            _linkTemplate(certId, templateIds[i]);

            unchecked {
                ++i;
            }
        }

        emit BatchCertificateIssued(certificateIds, _msgSender(), recipients);
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
    function revokeCertificate(
        uint256 certificateId
    ) external whenNotPaused onlyRole(ISSUER_ROLE) {
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

    /**
     * @notice Authorizes an institution to issue certificates.
     * @param institution Institution address to authorize.
     */
    function authorizeInstitution(
        address institution
    ) external onlyRole(ADMIN_ROLE) {
        _authorizeInstitution(institution);
    }

    /**
     * @notice Grants issuer permissions from the registry contract.
     * @dev Called by InstitutionRegistry when an institution is verified.
     */
    function authorizeInstitutionFromRegistry(
        address institution
    ) external onlyRole(REGISTRY_ROLE) {
        _authorizeInstitution(institution);
    }

    /**
     * @notice Removes issuer permissions from an institution.
     * @param institution Institution address to deauthorize.
     */
    function deauthorizeInstitution(
        address institution
    ) external onlyRole(ADMIN_ROLE) {
        if (institution == address(0)) revert ZeroAddress();
        authorizedInstitutions[institution] = false;
        _revokeRole(ISSUER_ROLE, institution);
        emit InstitutionDeauthorized(institution);
    }

    /**
     * @notice Pause issuing and revoking certificates.
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Resume issuing and revoking certificates.
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
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

    function _authorizeInstitution(address institution) private {
        if (institution == address(0)) revert ZeroAddress();
        if (!institutionRegistry.verifiedInstitutions(institution)) {
            revert InstitutionNotVerified(institution);
        }

        authorizedInstitutions[institution] = true;
        _grantRole(ISSUER_ROLE, institution);

        emit InstitutionAuthorized(institution);
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
}
