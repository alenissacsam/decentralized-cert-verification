// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";

import {TemplateManager} from "../src/TemplateManager.sol";

contract TemplateManagerTest is Test {
    TemplateManager internal manager;

    address internal admin = address(1);
    address internal institution = address(2);

    function setUp() public {
        vm.prank(admin);
        manager = new TemplateManager(admin);

        vm.prank(admin);
        manager.grantIssuerRole(institution);
    }

    function test_CreateTemplate_Success() public {
        vm.prank(institution);
        uint256 templateId = manager.createTemplate(
            "ipfs://template",
            true,
            "Hackathon"
        );

        assertEq(templateId, 1);

        TemplateManager.Template memory template = manager.getTemplate(
            templateId
        );
        assertEq(template.ipfsHash, "ipfs://template");
        assertEq(template.creator, institution);
        assertTrue(template.isPublic);
        assertEq(template.category, "Hackathon");
    }

    function test_CreateTemplate_RevertWhenEmptyFields() public {
        vm.prank(institution);
        vm.expectRevert(TemplateManager.EmptyField.selector);
        manager.createTemplate("", true, "Hackathon");
    }

    function test_ListPublicTemplates_ReturnsIds() public {
        vm.prank(institution);
        manager.createTemplate("ipfs://template", true, "Hackathon");

        vm.prank(institution);
        manager.createTemplate("ipfs://private", false, "Course");

        uint256[] memory publicTemplates = manager.listPublicTemplates();
        assertEq(publicTemplates.length, 1);
        assertEq(publicTemplates[0], 1);
    }

    function test_GetInstitutionTemplates() public {
        vm.prank(institution);
        manager.createTemplate("ipfs://template", true, "Hackathon");
        vm.prank(institution);
        manager.createTemplate("ipfs://template2", false, "Course");

        uint256[] memory templates = manager.getInstitutionTemplates(
            institution
        );
        assertEq(templates.length, 2);
        assertEq(templates[0], 1);
        assertEq(templates[1], 2);
    }

    function test_IncrementUsageCount_Success() public {
        vm.prank(institution);
        uint256 templateId = manager.createTemplate(
            "ipfs://template",
            true,
            "Hackathon"
        );

        bytes32 registryRole = manager.REGISTRY_ROLE();
        vm.prank(admin);
        manager.grantRole(registryRole, address(this));

        manager.incrementUsageCount(templateId);

        TemplateManager.Template memory template = manager.getTemplate(
            templateId
        );
        assertEq(template.usageCount, 1);
    }
}
