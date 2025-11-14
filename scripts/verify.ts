import { run } from "hardhat";

async function main() {
  console.log("Verifying Family Heirloom Key contract...");

  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Please set CONTRACT_ADDRESS environment variable");
  }

  console.log(`Verifying contract at: ${contractAddress}`);

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });

    console.log("✅ Contract verification successful!");
  } catch (error) {
    console.error("❌ Contract verification failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
