// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";

import {CertificateRegistry} from "../src/CertificateRegistry.sol";
import {InstitutionRegistry} from "../src/InstitutionRegistry.sol";
import {TemplateManager} from "../src/TemplateManager.sol";
import {NameRegistry} from "../src/NameRegistry.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address admin = vm.addr(deployerPrivateKey);

        console2.log("Deploying contracts with account:", admin);

        vm.startBroadcast(deployerPrivateKey);

        InstitutionRegistry institutionRegistry = new InstitutionRegistry(admin);
        TemplateManager templateManager = new TemplateManager(admin);
        CertificateRegistry certificateRegistry =
            new CertificateRegistry(address(institutionRegistry), admin, "ipfs://base-uri/");
        NameRegistry nameRegistry = new NameRegistry();

        institutionRegistry.setCertificateRegistry(address(certificateRegistry));
        certificateRegistry.setTemplateManager(address(templateManager));

        vm.stopBroadcast();

        console2.log("\n=== Deployment Summary ===");
        console2.log("InstitutionRegistry:", address(institutionRegistry));
        console2.log("TemplateManager:", address(templateManager));
        console2.log("CertificateRegistry:", address(certificateRegistry));
        console2.log("NameRegistry:", address(nameRegistry));
        console2.log("Admin Address:", admin);
    }
}
