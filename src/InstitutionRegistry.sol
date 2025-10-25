// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ICertificateRegistry} from "./interfaces/ICertificateRegistry.sol";


/**
 * @title InstitutionRegistry
 * @notice Manages institution onboarding and verification for the certificate platform.
 */
contract InstitutionRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REGISTRY_ROLE = keccak256("REGISTRY_ROLE");

    struct Institution {
        string name;
        string logoIpfsHash;
        string contactInfo;
        uint256 totalCertificatesIssued;
        uint256 registeredAt;
        bool verified;
    }

    mapping(address => Institution) private _institutions;
    mapping(address => bool) public verifiedInstitutions;

    ICertificateRegistry public certificateRegistry;
    uint256 public institutionCount;

    event InstitutionRegistered(address indexed institution, string name);
    event InstitutionVerified(address indexed institution);
    event InstitutionUpdated(address indexed institution);
    event CertificateRegistrySet(address indexed registry);

    error InstitutionAlreadyRegistered(address institution);
    error InstitutionNotRegistered(address institution);
    error InstitutionAlreadyVerified(address institution);
    error EmptyField();
    error ZeroAddress();

    constructor(address admin) {
        if (admin == address(0)) revert ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    /**
     * @notice Registers a new institution.
     * @param name Institution name.
     * @param logoIpfsHash IPFS hash for institution logo/branding.
     * @param contactInfo Contact metadata.
     */
    function registerInstitution(
        string calldata name,
        string calldata logoIpfsHash,
        string calldata contactInfo
    ) external {
        address institution = _msgSender();
        if (_institutions[institution].registeredAt != 0) {
            revert InstitutionAlreadyRegistered(institution);
        }
        if (
            bytes(name).length == 0 ||
            bytes(logoIpfsHash).length == 0 ||
            bytes(contactInfo).length == 0
        ) {
            revert EmptyField();
        }

        _institutions[institution] = Institution({
            name: name,
            logoIpfsHash: logoIpfsHash,
            contactInfo: contactInfo,
            totalCertificatesIssued: 0,
            registeredAt: block.timestamp,
            verified: false
        });

        unchecked {
            ++institutionCount;
        }

        emit InstitutionRegistered(institution, name);
    }

    /**
     * @notice Verifies an institution after due diligence.
     * @param institution Address of the institution to verify.
     */
    function verifyInstitution(
        address institution
    ) external onlyRole(ADMIN_ROLE) {
        if (institution == address(0)) revert ZeroAddress();
        Institution storage info = _institutions[institution];
        if (info.registeredAt == 0)
            revert InstitutionNotRegistered(institution);
        if (info.verified) revert InstitutionAlreadyVerified(institution);

        info.verified = true;
        verifiedInstitutions[institution] = true;

        if (address(certificateRegistry) != address(0)) {
            certificateRegistry.authorizeInstitutionFromRegistry(institution);
        }

        emit InstitutionVerified(institution);
    }

    /**
     * @notice Updates mutable institution details.
     * @param logoIpfsHash Updated IPFS hash for logo/branding.
     * @param contactInfo Updated contact metadata.
     */
    function updateInstitutionInfo(
        string calldata logoIpfsHash,
        string calldata contactInfo
    ) external {
        if (bytes(logoIpfsHash).length == 0 || bytes(contactInfo).length == 0) {
            revert EmptyField();
        }

        Institution storage info = _institutions[_msgSender()];
        if (info.registeredAt == 0)
            revert InstitutionNotRegistered(_msgSender());

        info.logoIpfsHash = logoIpfsHash;
        info.contactInfo = contactInfo;

        emit InstitutionUpdated(_msgSender());
    }

    /**
     * @notice Allows the certificate registry to increment issuance counters.
     * @dev Only callable by addresses with REGISTRY_ROLE.
     * @param institution Target institution address.
     */
    function incrementCertificateCount(
        address institution
    ) external onlyRole(REGISTRY_ROLE) {
        if (institution == address(0)) revert ZeroAddress();
        Institution storage info = _institutions[institution];
        if (info.registeredAt == 0)
            revert InstitutionNotRegistered(institution);

        unchecked {
            ++info.totalCertificatesIssued;
        }
    }

    /**
     * @notice Returns institution information.
     * @param institution Institution address.
     */
    function getInstitution(
        address institution
    ) external view returns (Institution memory) {
        if (institution == address(0)) revert ZeroAddress();
        Institution memory info = _institutions[institution];
        if (info.registeredAt == 0)
            revert InstitutionNotRegistered(institution);
        return info;
    }

    /**
     * @notice Sets the certificate registry that can manage institution state.
     * @param registry Address of the certificate registry contract.
     */
    function setCertificateRegistry(
        address registry
    ) external onlyRole(ADMIN_ROLE) {
        if (registry == address(0)) revert ZeroAddress();
        certificateRegistry = ICertificateRegistry(registry);
        emit CertificateRegistrySet(registry);
    }

    /**
     * @notice Returns institution storage without reverting when missing.
     * @param institution Address to query.
     */
    function institutionExists(
        address institution
    ) external view returns (bool) {
        return _institutions[institution].registeredAt != 0;
    }
}
