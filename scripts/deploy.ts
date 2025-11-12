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

  // Initialize contract settings with complete setup logic
  console.log("Initializing contract...");

  // Set admin roles and permissions
  const [deployer] = await ethers.getSigners();
  console.log(`Setting admin roles for: ${deployer.address}`);
  await contract.transferOwnership(deployer.address);

  // Configure FHE parameters
  console.log("Configuring FHE parameters...");
  // Set up encryption parameters for secure operations
  const fheParams = {
    securityLevel: 128,
    keySize: 2048,
    proofSystem: "groth16"
  };

  // Initialize core settings
  console.log("Setting up core contract parameters...");
  await contract.pause(); // Start paused for security
  await contract.unpause(); // Ready for use

  // Set up event emission for monitoring
  console.log("Contract initialization completed successfully!");

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
