// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TemplateManager
 * @notice Manages certificate template metadata for institutions.
 */
contract TemplateManager {
    address public immutable deployer;

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
        deployer = admin;
    }

    /**
     * @notice Creates a new certificate template.
     * @param ipfsHash CID pointing to the template asset.
     * @param isPublic Whether the template can be reused by all institutions.
     * @param category Informational category, e.g., "Hackathon".
     * @return templateId Newly created template identifier.
     */
    function createTemplate(string calldata ipfsHash, bool isPublic, string calldata category)
        external
        returns (uint256 templateId)
    {
        if (bytes(ipfsHash).length == 0 || bytes(category).length == 0) {
            revert EmptyField();
        }

        templateId = ++templateCounter;

        Template storage record = _templates[templateId];
        record.ipfsHash = ipfsHash;
        record.creator = msg.sender;
        record.isPublic = isPublic;
        record.category = category;
        record.createdAt = block.timestamp;

        _institutionTemplates[msg.sender].push(templateId);
        if (isPublic) {
            _publicTemplates.push(templateId);
        }

        emit TemplateCreated(templateId, msg.sender);
    }

    /**
     * @notice Returns template metadata.
     * @param templateId Template identifier.
     */
    function getTemplate(uint256 templateId) external view returns (Template memory) {
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
    function getInstitutionTemplates(address institution) external view returns (uint256[] memory) {
        if (institution == address(0)) revert ZeroAddress();
        return _institutionTemplates[institution];
    }

    /**
     * @notice Increments usage metrics, callable by the certificate registry.
     * @param templateId Target template identifier.
     */
    function incrementUsageCount(uint256 templateId) external {
        Template storage record = _templates[templateId];
        if (record.createdAt == 0) revert TemplateNotFound(templateId);

        unchecked {
            ++record.usageCount;
        }

        emit TemplateUsed(templateId);
    }
}
