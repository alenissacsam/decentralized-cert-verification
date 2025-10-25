// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title TemplateManager
 * @notice Manages certificate template metadata for institutions.
 */
contract TemplateManager is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant REGISTRY_ROLE = keccak256("REGISTRY_ROLE");

    struct Template {
        string ipfsHash;
        address creator;
        bool isPublic;
        string category;
        uint256 usageCount;
        uint256 createdAt;
    }

    mapping(uint256 => Template) private _templates;
    mapping(address => uint256[]) private _institutionTemplates;
    uint256[] private _publicTemplates;

    uint256 public templateCounter;

    event TemplateCreated(uint256 indexed templateId, address indexed creator);
    event TemplateUsed(uint256 indexed templateId);

    error EmptyField();
    error ZeroAddress();
    error TemplateNotFound(uint256 templateId);

    constructor(address admin) {
        if (admin == address(0)) revert ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(ISSUER_ROLE, admin);
    }

    /**
     * @notice Creates a new certificate template.
     * @param ipfsHash CID pointing to the template asset.
     * @param isPublic Whether the template can be reused by all institutions.
     * @param category Informational category, e.g., "Hackathon".
     * @return templateId Newly created template identifier.
     */
    function createTemplate(
        string calldata ipfsHash,
        bool isPublic,
        string calldata category
    ) external onlyRole(ISSUER_ROLE) returns (uint256 templateId) {
        if (bytes(ipfsHash).length == 0 || bytes(category).length == 0)
            revert EmptyField();

        templateId = ++templateCounter;

        Template storage record = _templates[templateId];
        record.ipfsHash = ipfsHash;
        record.creator = _msgSender();
        record.isPublic = isPublic;
        record.category = category;
        record.createdAt = block.timestamp;

        _institutionTemplates[_msgSender()].push(templateId);
        if (isPublic) {
            _publicTemplates.push(templateId);
        }

        emit TemplateCreated(templateId, _msgSender());
    }

    /**
     * @notice Returns template metadata.
     * @param templateId Template identifier.
     */
    function getTemplate(
        uint256 templateId
    ) external view returns (Template memory) {
        Template memory record = _templates[templateId];
        if (record.createdAt == 0) revert TemplateNotFound(templateId);
        return record;
    }

    /**
     * @notice Lists all public template identifiers.
     */
    function listPublicTemplates() external view returns (uint256[] memory) {
        return _publicTemplates;
    }

    /**
     * @notice Returns template identifiers created by an institution.
     * @param institution Target institution address.
     */
    function getInstitutionTemplates(
        address institution
    ) external view returns (uint256[] memory) {
        if (institution == address(0)) revert ZeroAddress();
        return _institutionTemplates[institution];
    }

    /**
     * @notice Increments usage metrics, callable by the certificate registry.
     * @param templateId Target template identifier.
     */
    function incrementUsageCount(
        uint256 templateId
    ) external onlyRole(REGISTRY_ROLE) {
        Template storage record = _templates[templateId];
        if (record.createdAt == 0) revert TemplateNotFound(templateId);

        unchecked {
            ++record.usageCount;
        }

        emit TemplateUsed(templateId);
    }

    /**
     * @notice Grants issuer role to an institution.
     * @dev Convenience helper for admins.
     * @param institution Recipient institution address.
     */
    function grantIssuerRole(
        address institution
    ) external onlyRole(ADMIN_ROLE) {
        if (institution == address(0)) revert ZeroAddress();
        _grantRole(ISSUER_ROLE, institution);
    }
}
