// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";

import {CertificateRegistry} from "../src/CertificateRegistry.sol";
import {InstitutionRegistry} from "../src/InstitutionRegistry.sol";
import {TemplateManager} from "../src/TemplateManager.sol";
import {NameRegistry} from "../src/NameRegistry.sol";
import {GuardianAccount} from "../src/GuardianAccount.sol";
import {GuardianRecovery} from "../src/GuardianRecovery.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address admin = vm.envOr("ADMIN_ADDRESS", deployer);
        string memory defaultBaseUri = "ipfs://base-uri/";
        string memory baseUri = vm.envOr("CERTIFICATE_BASE_URI", defaultBaseUri);

        console2.log("Deploying contracts with account:", deployer);
        console2.log("Admin configured as:", admin);
        console2.log("Certificate base URI:", baseUri);

        vm.startBroadcast(deployerPrivateKey);

        InstitutionRegistry institutionRegistry = new InstitutionRegistry(admin);
        TemplateManager templateManager = new TemplateManager(admin);
        CertificateRegistry certificateRegistry =
            new CertificateRegistry(address(institutionRegistry), admin, baseUri);
        NameRegistry nameRegistry = new NameRegistry();
        GuardianRecovery guardianRecovery = new GuardianRecovery();
        GuardianAccount guardianAccount = new GuardianAccount(admin);

        guardianAccount.setGuardianModule(address(guardianRecovery));
        institutionRegistry.setCertificateRegistry(address(certificateRegistry));
        certificateRegistry.setTemplateManager(address(templateManager));

        address[] memory defaultGuardians = new address[](0);
        address[] memory guardians = vm.envOr("GUARDIAN_ADDRESSES", ",", defaultGuardians);
        uint256 guardianThreshold = vm.envOr("GUARDIAN_THRESHOLD", uint256(0));

        if (guardians.length > 0) {
            if (guardianThreshold == 0 || guardianThreshold > guardians.length) {
                revert("Invalid guardian configuration");
            }

            bytes memory configureData = abi.encodeWithSelector(
                GuardianRecovery.configureGuardians.selector,
                guardians,
                guardianThreshold
            );

            guardianAccount.execute(address(guardianRecovery), 0, configureData);
        }

        vm.stopBroadcast();

        console2.log("\n=== Deployment Summary ===");
        console2.log("InstitutionRegistry:", address(institutionRegistry));
        console2.log("TemplateManager:", address(templateManager));
        console2.log("CertificateRegistry:", address(certificateRegistry));
        console2.log("NameRegistry:", address(nameRegistry));
        console2.log("GuardianRecovery:", address(guardianRecovery));
        console2.log("GuardianAccount:", address(guardianAccount));
        console2.log("Admin Address:", admin);
        console2.log("Deployer Address:", deployer);
        console2.log("Certificate Base URI:", baseUri);
        if (guardians.length == 0) {
            console2.log("Guardians not configured during deployment");
        } else {
            console2.log("Guardian Threshold:", guardianThreshold);
            for (uint256 i = 0; i < guardians.length; ++i) {
                console2.log("Guardian:", guardians[i]);
            }
        }
    }
}
