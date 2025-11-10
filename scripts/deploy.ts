import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Family Heirloom Key contract...");

  const ContractFactory = await ethers.getContractFactory("FamilyHeirloomKey");
  const contract = await ContractFactory.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`FamilyHeirloomKey deployed to: ${contractAddress}`);

  // Wait for block confirmations
  console.log("Waiting for confirmations...");
  await contract.deploymentTransaction()?.wait(5);

  console.log("Deployment completed successfully!");

  // Verify contract on Etherscan (if on mainnet)
  if (network.name === "mainnet" || network.name === "sepolia") {
    console.log("Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.error("Verification failed:", error);
    }
  }

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
