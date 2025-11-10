import { expect } from "chai";
import { ethers } from "hardhat";
import { FamilyHeirloomKey } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("FamilyHeirloomKey Integration Tests", function () {
  let contract: FamilyHeirloomKey;
  let owner: SignerWithAddress;
  let heir: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async function () {
    [owner, heir, other] = await ethers.getSigners();

    const ContractFactory = await ethers.getContractFactory("FamilyHeirloomKey");
    contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
  });

  describe("Complete Inheritance Flow", function () {
    it("Should execute complete heirloom creation to inheritance flow", async function () {
      // 1. Mint heirloom
      const title = "Family Gold Watch";
      const description = "Passed down through generations";
      const deadline = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year

      await expect(contract.mintHeirloom(
        title,
        description,
        ethers.ZeroHash, // placeholder for encrypted value
        ethers.ZeroHash, // placeholder for proof
        heir.address,
        deadline
      )).to.emit(contract, "HeirloomCreated");

      // 2. Verify heirloom details
      const heirloom = await contract.getHeirloom(0);
      expect(heirloom.title).to.equal(title);
      expect(heirloom.description).to.equal(description);
      expect(heirloom.designatedHeir).to.equal(heir.address);
      expect(heirloom.creator).to.equal(owner.address);
      expect(heirloom.isActive).to.be.true;
      expect(heirloom.inheritanceTriggered).to.be.false;

      // 3. Change designated heir
      await expect(contract.setDesignatedHeir(0, other.address))
        .to.emit(contract, "HeirloomTransferred");

      const updatedHeirloom = await contract.getHeirloom(0);
      expect(updatedHeirloom.designatedHeir).to.equal(other.address);

      // 4. Attempt inheritance request before deadline (should fail)
      await expect(contract.connect(other).requestInheritance(
        0,
        ethers.ZeroHash, // placeholder for proof of life
        ethers.ZeroHash  // placeholder for life proof
      )).to.be.revertedWith("Inheritance deadline has passed");

      // Note: In real FHE implementation, we would need proper encrypted values and proofs
      // This test demonstrates the flow structure with placeholder values
    });
  });

  describe("Access Control Integration", function () {
    beforeEach(async function () {
      const deadline = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      await contract.mintHeirloom(
        "Test Heirloom",
        "Description",
        ethers.ZeroHash,
        ethers.ZeroHash,
        heir.address,
        deadline
      );
    });

    it("Should enforce heirloom ownership across all functions", async function () {
      // Owner can set heir
      await expect(contract.setDesignatedHeir(0, other.address)).to.not.be.reverted;

      // Non-owner cannot set heir
      await expect(contract.connect(heir).setDesignatedHeir(0, other.address))
        .to.be.revertedWith("Only heirloom owner can perform this action");

      // Only designated heir can request inheritance
      // (This would require deadline to be passed and proper FHE proofs)
      await expect(contract.connect(other).requestInheritance(0, ethers.ZeroHash, ethers.ZeroHash))
        .to.be.revertedWith("Only designated heir can perform this action");
    });

    it("Should handle pausing correctly across operations", async function () {
      // Pause contract
      await contract.pause();
      expect(await contract.paused()).to.be.true;

      // Minting should be blocked when paused
      const deadline = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      await expect(contract.mintHeirloom(
        "Paused Test",
        "Should fail",
        ethers.ZeroHash,
        ethers.ZeroHash,
        heir.address,
        deadline
      )).to.be.revertedWith("Contract is paused");

      // Setting heir should be blocked when paused
      await expect(contract.setDesignatedHeir(0, other.address))
        .to.be.revertedWith("Contract is paused");

      // Unpause
      await contract.unpause();
      expect(await contract.paused()).to.be.false;

      // Operations should work again
      await expect(contract.setDesignatedHeir(0, other.address)).to.not.be.reverted;
    });
  });

  describe("User Heirloom Management", function () {
    it("Should track user heirlooms correctly", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

      // Mint multiple heirlooms
      await contract.mintHeirloom("Heirloom 1", "Desc 1", ethers.ZeroHash, ethers.ZeroHash, heir.address, deadline);
      await contract.mintHeirloom("Heirloom 2", "Desc 2", ethers.ZeroHash, ethers.ZeroHash, heir.address, deadline);

      expect(await contract.heirloomCount()).to.equal(2);
      expect(await contract.getUserHeirloomCount(owner.address)).to.equal(2);

      const userHeirlooms = await contract.getUserHeirlooms(owner.address);
      expect(userHeirlooms).to.have.lengthOf(2);
      expect(userHeirlooms[0]).to.equal(0);
      expect(userHeirlooms[1]).to.equal(1);
    });

    it("Should validate heirloom existence", async function () {
      expect(await contract.heirloomExists(0)).to.be.false; // No heirlooms minted yet

      const deadline = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      await contract.mintHeirloom("Test", "Desc", ethers.ZeroHash, ethers.ZeroHash, heir.address, deadline);

      expect(await contract.heirloomExists(0)).to.be.true;
      expect(await contract.heirloomExists(1)).to.be.false; // Non-existent token
    });
  });

  describe("Contract Statistics", function () {
    it("Should provide accurate contract statistics", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

      // Initially empty
      const initialStats = await contract.getContractStats();
      expect(initialStats.totalHeirlooms).to.equal(0);
      expect(initialStats.activeHeirlooms).to.equal(0);

      // Add heirlooms
      await contract.mintHeirloom("Heirloom 1", "Desc 1", ethers.ZeroHash, ethers.ZeroHash, heir.address, deadline);
      await contract.mintHeirloom("Heirloom 2", "Desc 2", ethers.ZeroHash, ethers.ZeroHash, heir.address, deadline);

      const updatedStats = await contract.getContractStats();
      expect(updatedStats.totalHeirlooms).to.equal(2);
      expect(updatedStats.activeHeirlooms).to.equal(2);
    });
  });
});
