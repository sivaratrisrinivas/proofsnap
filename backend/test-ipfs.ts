import { uploadToPinata, getIpfsUrl } from "./src/services/ipfsService";

async function testIPFS() {
  try {
    console.log("Testing IPFS upload...");

    const testData = Buffer.from("Hello ProofSnap! This is a test file.");
    const ipfsHash = await uploadToPinata(testData, "test-file.txt");

    console.log(`✅ Test successful!`);
    console.log(`IPFS Hash: ${ipfsHash}`);
    console.log(`IPFS URL: ${getIpfsUrl(ipfsHash)}`);
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testIPFS();
