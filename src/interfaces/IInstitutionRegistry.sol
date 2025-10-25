// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IInstitutionRegistry {
    function verifiedInstitutions(
        address institution
    ) external view returns (bool);

    function incrementCertificateCount(address institution) external;
}
