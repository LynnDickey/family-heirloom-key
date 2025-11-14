import { task } from "hardhat/config";
import { FamilyHeirloomKey } from "../typechain-types";

task("batch-mint", "Batch mint multiple heirlooms")
  .addParam("count", "Number of heirlooms to mint")
  .addParam("heir", "Heir address")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;
    const [signer] = await ethers.getSigners();

    const contract = await ethers.getContract<FamilyHeirloomKey>("FamilyHeirloomKey");

    console.log(`Batch minting ${taskArgs.count} heirlooms...`);

    for (let i = 0; i < parseInt(taskArgs.count); i++) {
      const deadline = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      const tx = await contract.mintHeirloom(
        `Batch Heirloom #${i + 1}`,
        `Description for heirloom ${i + 1}`,
        ethers.ZeroHash,
        ethers.ZeroHash,
        taskArgs.heir,
        deadline
      );
      await tx.wait();
      console.log(`Minted heirloom ${i + 1}/${taskArgs.count}`);
    }

    console.log("Batch minting completed!");
  });

task("batch-transfer", "Batch transfer multiple tokens")
  .addParam("recipients", "Comma-separated list of recipient addresses")
  .addParam("tokenIds", "Comma-separated list of token IDs")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;

    const contract = await ethers.getContract<FamilyHeirloomKey>("FamilyHeirloomKey");

    const recipients = taskArgs.recipients.split(",");
    const tokenIds = taskArgs.tokenIds.split(",").map((id: string) => parseInt(id));

    if (recipients.length !== tokenIds.length) {
      throw new Error("Recipients and tokenIds arrays must have the same length");
    }

    console.log(`Batch transferring ${tokenIds.length} tokens...`);

    const tx = await contract.batchTransfer(recipients, tokenIds);
    await tx.wait();

    console.log("Batch transfer completed!");
  });
