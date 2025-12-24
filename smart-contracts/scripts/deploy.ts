import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ProofSnap to Polygon Amoy...");

  const ProofSnap = await ethers.getContractFactory("ProofSnap");
  const contract = await ProofSnap.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ ProofSnap deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
