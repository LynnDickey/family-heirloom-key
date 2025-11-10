import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedEncryptedBalanceVerifier = await deploy("EncryptedBalanceVerifier", {
    from: deployer,
    log: true,
  });

  console.log(`EncryptedBalanceVerifier contract: `, deployedEncryptedBalanceVerifier.address);
};
export default func;
func.id = "deploy_encryptedBalanceVerifier"; // id required to prevent reexecution
func.tags = ["EncryptedBalanceVerifier"];
