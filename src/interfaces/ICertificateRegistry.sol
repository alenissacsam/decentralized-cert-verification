// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICertificateRegistry {
    function authorizeInstitutionFromRegistry(address institution) external;
}
