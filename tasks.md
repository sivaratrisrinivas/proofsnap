# Implementation Plan: TruthLens MVP

**Objective:** Build a verifiable media provenance camera app.
**Stack:** Bun, Hono, React Native (Expo), Polygon, Supabase.

---

## Phase 1: Infrastructure & Environment Setup
*Foundational setup to ensure the monorepo structure is correct.*

- [x] **Step 1: Initialize Monorepo & Backend**
    - **Task:** Create the root directory `truth-lens`. Inside, initialize a Bun project for `backend` and install Hono.
    - **Test:** Run `bun run dev` in `backend/` and access `http://localhost:3000` to see a "Hello Hono" message.

- [x] **Step 2: Initialize Mobile App**
    - **Task:** Initialize the `mobile` directory using Expo (TypeScript template).
    - **Test:** Run `npx expo start` and successfully open the default app on a Simulator or physical device.

- [x] **Step 3: Database Setup (Supabase)**
    - **Task:** Create a free Supabase project. Copy the connection string. In the `backend`, install the Supabase client and configure environment variables.
    - **Test:** Create a script `test-db.ts` that inserts a dummy row into a test table and reads it back using Bun.

---

## Phase 2: Smart Contracts (The Truth Layer)
*We need the contract deployed so the backend has an address to talk to.*

- [x] **Step 4: Hardhat Setup**
    - **Task:** Create a `smart-contracts` folder. Initialize Hardhat with TypeScript.
    - **Test:** Run `npx hardhat test` and see the default sample test pass.

- [x] **Step 5: Write TruthLens.sol**
    - **Task:** Write the Solidity contract defining the `MediaRecord` struct and the `registerMedia` function.
    - **Test:** The contract compiles without errors using `npx hardhat compile`.

- [x] **Step 6: Test Smart Contract Logic**
    - **Task:** Write a Hardhat test file that deploys the contract and calls `registerMedia` to ensure it saves data correctly.
    - **Test:** Run `npx hardhat test` and confirm all tests pass.

- [ ] **Step 7: Deploy to Polygon Amoy (Testnet)**
    - **Task:** Configure Hardhat for Polygon Amoy Testnet. Write a deployment script. Deploy the contract.
    - **Test:** Get the contract address and verify it exists on the Amoy Block Explorer. Save the address to `.env`.
    - **Note:** Deploy script exists but Hardhat config only has Sepolia configured, not Amoy.

---

## Phase 3: Backend Services (The Logic Layer)
*Building the API that the phone will talk to.*

- [x] **Step 8: IPFS Service Integration**
    - **Task:** Sign up for Pinata. Create a service file `ipfsService.ts` in the backend that takes a file buffer and uploads it to Pinata.
    - **Test:** Write a test script that uploads a text file and returns a valid IPFS Hash/CID.

- [x] **Step 9: Blockchain Write Service**
    - **Task:** Install `ethers`. Create `blockchainService.ts`. Implement a function that takes an IPFS hash + metadata and writes it to your deployed contract using the backend's private key.
    - **Test:** Run the service locally; check the Block Explorer to see a new transaction appear.

- [x] **Step 10: Database Schema Migration**
    - **Task:** In Supabase, create the `users` and `media_records` tables as defined in the Spec.
    - **Test:** Verify the tables exist in the Supabase Dashboard.

- [x] **Step 11: Implement API: Mint Endpoint (Logic)**
    - **Task:** Create the POST `/api/mint` route in Hono. It should parse the body, upload to IPFS (Step 8), write to Blockchain (Step 9), and save to DB (Step 10).
    - **Test:** Use `curl` or Postman to send a dummy JSON object to the endpoint and receive a success response with a Transaction Hash.

- [ ] **Step 12: Implement API: Verify Endpoint**
    - **Task:** Create GET `/api/verify/:hash`. It should query the Supabase DB (or Blockchain) and return the media details.
    - **Test:** Request the hash generated in Step 11 and receive the JSON metadata.

---

## Phase 4: Mobile Core (The Camera)
*Getting the physical hardware working.*

- [x] **Step 13: Camera Permissions & View**
    - **Task:** Install `expo-camera`. specific permissions in `app.json`. Create a `CameraScreen` that displays the live view.
    - **Test:** App opens and shows the real-time camera feed on the device.

- [x] **Step 14: Capture Functionality**
    - **Task:** Add a shutter button. When pressed, take a picture and save it to the device's temporary storage.
    - **Test:** Tapping the button logs the file URI to the console.

- [x] **Step 15: Local Hashing Logic**
    - **Task:** Install `expo-crypto` and `expo-file-system`. Read the captured file as a binary string and generate a SHA-256 hash.
    - **Test:** Take a photo; console logs a 64-character hash string.

---

## Phase 5: Mobile Integration (Connecting the Dots)
*Connecting the phone to the backend.*

- [x] **Step 16: Wallet Generation (Invisible)**
    - **Task:** Install `ethers` on mobile. Create a `useWallet` hook that generates a random wallet on first launch and saves the private key to SecureStore.
    - **Test:** App launch logs "Wallet Loaded: 0x..." and persists across restarts.

- [x] **Step 17: Signing the Image**
    - **Task:** When a photo is taken, use the Wallet (Step 16) to cryptographically sign the Image Hash (Step 15).
    - **Test:** Console logs the `signature` string alongside the hash.

- [x] **Step 18: Upload Integration**
    - **Task:** Implement the network request to POST the image file + signature to your Backend `/mint` endpoint.
    - **Test:** Take a photo -> App shows "Uploading..." -> Backend receives it -> App alerts "Secured!".

---

## Phase 6: The "Aha" Moment (Watermarking & Polish)
*Adding the visual proof.*

- [ ] **Step 19: Watermark Overlay Setup**
    - **Task:** Install `react-native-skia` or `expo-image-manipulator`. Create a function that overlays a logo/QR code on the bottom right of the image.
    - **Test:** Taken photos now appear in the gallery with the visible "Truth Sigil."

- [ ] **Step 20: Gallery View**
    - **Task:** Create a simple screen to view the list of photos taken within the app.
    - **Test:** User can scroll through their history of "Trusted" photos.

- [ ] **Step 21: Verification Link Generation**
    - **Task:** When the user shares the photo, attach a text caption or metadata containing the URL `https://truthlens.app/verify/[hash]`.
    - **Test:** Clicking "Share" opens the native share sheet with the correct link pre-filled.

---

## Phase 7: Deployment (MVP Release)
*Getting it live.*

- [ ] **Step 22: Deploy Backend**
    - **Task:** Deploy the Bun/Hono server to a provider like Railway or Render (dockerized).
    - **Test:** Public API endpoint returns 200 OK.

- [ ] **Step 23: Build Mobile App (APK/IPA)**
    - **Task:** Configure `eas.json`. Run `eas build` for Android (easier for testing).
    - **Test:** Install the `.apk` on a real Android phone and take a trusted photo.