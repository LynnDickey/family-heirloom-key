import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { EncryptedBalanceVerifier } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("EncryptedBalanceVerifierSepolia", function () {
  let signers: Signers;
  let contract: EncryptedBalanceVerifier;
  let contractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const deployment = await deployments.get("EncryptedBalanceVerifier");
      contractAddress = deployment.address;
      contract = await ethers.getContractAt("EncryptedBalanceVerifier", deployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should set balance and verify spending", async function () {
    steps = 15;

    this.timeout(4 * 40000);

    const balance = 1000;
    const spending = 500;

    progress(`Encrypting balance=${balance}...`);
    const encryptedBalance = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(balance)
      .encrypt();

    progress(`Call setBalance() contract=${contractAddress} signer=${signers.alice.address}...`);
    let tx = await contract
      .connect(signers.alice)
      .setBalance(encryptedBalance.handles[0], encryptedBalance.inputProof);
    await tx.wait();

    progress(`Call getBalance()...`);
    const storedBalance = await contract.getBalance(signers.alice.address);
    expect(storedBalance).to.not.eq(ethers.ZeroHash);

    progress(`Decrypting getBalance()=${storedBalance}...`);
    const decryptedBalance = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      storedBalance,
      contractAddress,
      signers.alice,
    );
    progress(`Clear getBalance()=${decryptedBalance}`);
    expect(decryptedBalance).to.eq(balance);

    progress(`Encrypting spending=${spending}...`);
    const encryptedSpending = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(spending)
      .encrypt();

    progress(`Call verifySpending() contract=${contractAddress} signer=${signers.alice.address}...`);
    tx = await contract
      .connect(signers.alice)
      .verifySpending(encryptedSpending.handles[0], encryptedSpending.inputProof);
    await tx.wait();

    progress(`Call getVerificationResult()...`);
    const result = await contract.getVerificationResult(signers.alice.address);

    progress(`Decrypting getVerificationResult()=${result}...`);
    const decryptedResult = await fhevm.userDecryptEbool(
      result,
      contractAddress,
      signers.alice,
    );
    progress(`Clear getVerificationResult()=${decryptedResult}`);

    expect(decryptedResult).to.be.true; // balance >= spending
  });

  it("should deny spending when insufficient balance", async function () {
    steps = 15;

    this.timeout(4 * 40000);

    const balance = 500;
    const spending = 1000;

    progress(`Encrypting balance=${balance}...`);
    const encryptedBalance = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(balance)
      .encrypt();

    progress(`Call setBalance()...`);
    let tx = await contract
      .connect(signers.alice)
      .setBalance(encryptedBalance.handles[0], encryptedBalance.inputProof);
    await tx.wait();

    progress(`Encrypting spending=${spending}...`);
    const encryptedSpending = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(spending)
      .encrypt();

    progress(`Call verifySpending()...`);
    tx = await contract
      .connect(signers.alice)
      .verifySpending(encryptedSpending.handles[0], encryptedSpending.inputProof);
    await tx.wait();

    progress(`Call getVerificationResult()...`);
    const result = await contract.getVerificationResult(signers.alice.address);

    progress(`Decrypting getVerificationResult()...`);
    const decryptedResult = await fhevm.userDecryptEbool(
      result,
      contractAddress,
      signers.alice,
    );
    progress(`Clear getVerificationResult()=${decryptedResult}`);

    expect(decryptedResult).to.be.false; // balance < spending
  });
});

