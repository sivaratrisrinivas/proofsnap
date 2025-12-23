import { expect } from "chai";
import { ethers } from "hardhat";
import { ProofSnap } from "../typechain-types";

describe("ProofSnap", () => {
  let proofSnap: ProofSnap;

  beforeEach(async () => {
    const ProofSnapFactory = await ethers.getContractFactory("ProofSnap");
    proofSnap = (await ProofSnapFactory.deploy()) as ProofSnap;
    await proofSnap.waitForDeployment();
  });

  it("should register media and store proof correctly", async () => {
    const [creator] = await ethers.getSigners();

    const contentHash =
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const locationData = "encrypted:12.34,56.78";
    const deviceId = "device-hash-123";

    await proofSnap
      .connect(creator)
      .registerMedia(contentHash as `0x${string}`, locationData, deviceId);

    const exists = await proofSnap.proofExists(
      contentHash as `0x${string}`
    );
    expect(exists).to.equal(true);

    const proof = await proofSnap.getProof(
      contentHash as `0x${string}`
    );

    expect(proof.contentHash).to.equal(contentHash);
    expect(proof.creator).to.equal(creator.address);
    expect(proof.locationData).to.equal(locationData);
    expect(proof.deviceId).to.equal(deviceId);
    expect(proof.timestamp).to.be.gt(0n);
  });

  it("should not allow duplicate registrations for same hash", async () => {
    const [creator] = await ethers.getSigners();

    const contentHash =
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    const locationData = "loc1";
    const deviceId = "dev1";

    await proofSnap
      .connect(creator)
      .registerMedia(contentHash as `0x${string}`, locationData, deviceId);

    await expect(
      proofSnap
        .connect(creator)
        .registerMedia(contentHash as `0x${string}`, locationData, deviceId)
    ).to.be.revertedWith("Proof already exists");
  });
});
