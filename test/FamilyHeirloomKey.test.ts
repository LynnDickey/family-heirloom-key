import { expect } from "chai";
import { ethers } from "hardhat";
import { FamilyHeirloomKey } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("FamilyHeirloomKey", function () {
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

  describe("Minting", function () {
    it("Should mint a new heirloom", async function () {
      const title = "Grandfather's Watch";
      const description = "A precious family heirloom";
      const deadline = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year

      await expect(contract.mintHeirloom(
        title,
        description,
        ethers.ZeroHash, // placeholder for encrypted value
        ethers.ZeroHash, // placeholder for proof
        heir.address,
        deadline
      )).to.emit(contract, "HeirloomCreated");

      expect(await contract.heirloomCount()).to.equal(1);
    });

    it("Should reject invalid title", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

      await expect(contract.mintHeirloom(
        "", // empty title
        "Description",
        ethers.ZeroHash,
        ethers.ZeroHash,
        heir.address,
        deadline
      )).to.be.revertedWith("Title must be 1-100 characters");
    });

    it("Should reject minting when contract is paused", async function () {
      await contract.pause();
      const deadline = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

      await expect(contract.mintHeirloom(
        "Test Heirloom",
        "Description",
        ethers.ZeroHash,
        ethers.ZeroHash,
        heir.address,
        deadline
      )).to.be.revertedWith("Contract is paused");
    });

    it("Should reject self as heir", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

      await expect(contract.mintHeirloom(
        "Title",
        "Description",
        ethers.ZeroHash,
        ethers.ZeroHash,
        owner.address, // self as heir
        deadline
      )).to.be.revertedWith("Cannot designate yourself as heir");
    });
  });

  describe("Access Control", function () {
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

    it("Should allow owner to set designated heir", async function () {
      await expect(contract.setDesignatedHeir(0, other.address))
        .to.emit(contract, "HeirloomTransferred");
    });

    it("Should reject zero address as heir", async function () {
      await expect(contract.setDesignatedHeir(0, ethers.ZeroAddress))
        .to.be.revertedWith("Heir cannot be zero address");
    });

    it("Should reject non-owner from setting heir", async function () {
      await expect(contract.connect(other).setDesignatedHeir(0, other.address))
        .to.be.revertedWith("Only heirloom owner can perform this action");
    });
  });

  describe("Pausing", function () {
    it("Should allow owner to pause and unpause", async function () {
      await expect(contract.pause()).to.emit(contract, "Paused");
      expect(await contract.paused()).to.be.true;

      await expect(contract.unpause()).to.emit(contract, "Unpaused");
      expect(await contract.paused()).to.be.false;
    });

    it("Should reject non-owner from pausing", async function () {
      await expect(contract.connect(other).pause())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
