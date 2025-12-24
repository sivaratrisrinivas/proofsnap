# TruthLens (ProofSnap)

A "Super Normal" camera application that establishes media provenance at the point of capture. TruthLens solves the deepfake crisis not by detecting fakes, but by cryptographically proving reality.

## Core Philosophy

- **The Shutter is the Mint:** No blockchain jargon. Taking a photo automatically secures it.
- **Design Dissolves in Behavior:** The app functions exactly like the native iOS/Android camera.
- **Viral Loop:** Every shared image bears a subtle "Truth Sigil" watermark that prompts verification and app discovery.

## Tech Stack

### Backend (The Speed Layer)
- **Runtime**: [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- **Framework**: [Hono](https://hono.dev) - Ultrafast web framework optimized for Bun
- **Language**: TypeScript
- **Validation**: Zod with `@hono/zod-validator`
- **Database**: [Supabase](https://supabase.com) - PostgreSQL database for user profiles and off-chain indexing
- **Storage**: IPFS (via [Pinata](https://pinata.cloud) API) - Decentralized file storage
- **Blockchain**: [ethers.js](https://ethers.org) v6 - For smart contract interaction

### Mobile (The "Super Normal" Interface)
- **Framework**: [Expo](https://expo.dev) - React Native framework
- **Runtime**: React Native 0.81.5
- **React**: 19.1.0
- **Language**: TypeScript
- **Architecture**: New Architecture enabled
- **Key Libraries**:
  - `expo-camera`: For capturing media (✅ implemented)
  - `expo-crypto`: For SHA-256 hash generation (✅ implemented)
  - `expo-file-system`: Available for local file manipulation
  - `ethers` (v6): For wallet creation and blockchain interaction (✅ implemented)
  - `expo-secure-store`: For secure wallet key storage (✅ implemented)
  - `skia` (React Native Skia): For high-performance watermark compositing (⏳ TODO)

### Smart Contracts (The Trust Layer)
- **Blockchain**: Polygon (PoS) / Sepolia (testnet) - Low fees, fast finality
- **Framework**: [Hardhat](https://hardhat.org) - Development environment for Ethereum
- **Language**: Solidity 0.8.28
- **Testing**: Hardhat with TypeScript
- **Deployment**: Hardhat scripts with ethers.js v6

## Project Structure

```
proofsnap/
├── backend/                # Bun + Hono API
│   ├── index.ts            # Main application entry point
│   ├── package.json        # Dependencies and scripts
│   ├── tsconfig.json       # TypeScript configuration
│   ├── bunfig.toml         # Bun environment configuration
│   ├── test-db.ts          # Supabase database test utility
│   ├── test-ipfs.ts        # IPFS upload test utility
│   └── src/                # Source code
│       ├── controllers/    # HTTP request handlers
│       │   └── mintController.ts  # Media minting endpoint
│       └── services/       # Business logic services
│           ├── ipfsService.ts      # Pinata IPFS integration
│           └── blockchainService.ts  # Smart contract interaction
├── mobile/                 # React Native + Expo
│   ├── App.tsx             # Main React Native component
│   ├── index.ts            # App entry point
│   ├── app.json            # Expo configuration
│   ├── package.json        # Dependencies and scripts
│   ├── tsconfig.json       # TypeScript configuration
│   └── src/                # Source code
│       └── screens/        # Screen components
│           └── CameraScreen.tsx  # Camera capture screen
├── smart-contracts/        # Hardhat project
│   ├── contracts/          # Solidity smart contracts
│   │   ├── ProofSnap.sol   # Main contract for media provenance
│   │   └── Lock.sol        # Sample contract (template)
│   ├── scripts/            # Deployment scripts
│   │   └── deploy.ts       # ProofSnap contract deployment
│   ├── test/               # Contract tests
│   │   ├── ProofSnap.ts    # Tests for ProofSnap contract
│   │   └── Lock.ts         # Tests for Lock contract
│   ├── ignition/           # Deployment modules
│   ├── hardhat.config.ts   # Hardhat configuration
│   └── package.json        # Dependencies and scripts
├── README.md               # This file
└── spec.md                 # Project specification document
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed (v1.2.23+)
- [Node.js](https://nodejs.org/) (v18+) - For Expo CLI and Hardhat
- [Expo Go](https://expo.dev/client) app on your mobile device (optional)
- Supabase account and project (for backend database)
- Polygon network access (for smart contract deployment)

### Backend Setup

```bash
cd backend
bun install
```

#### Environment Configuration

Configure environment variables in `backend/bunfig.toml`:

```toml
[env]
SUPABASE_URL = "your-supabase-url"
SUPABASE_ANON_KEY = "your-supabase-anon-key"
PINATA_JWT = "your-pinata-jwt-token"
```

Required services:
- **Supabase**: For user profiles and media record indexing
- **Pinata**: For IPFS file storage (get JWT token from [Pinata Dashboard](https://app.pinata.cloud))

#### Development

Run the development server with hot reload:

```bash
bun run dev
```

The server will start and watch for file changes.

#### Testing Utilities

Test Supabase connection:
```bash
bun run test-db.ts
```

Test IPFS upload:
```bash
bun run test-ipfs.ts
```

#### Type Checking

```bash
bun run typecheck
```

### Mobile Setup

```bash
cd mobile
bun install
```

#### Development

Start the Expo development server:

```bash
bun run start
```

Run on specific platforms:

```bash
bun run android  # Android emulator/device
bun run ios      # iOS simulator/device
bun run web      # Web browser
```

#### Current Implementation

The mobile app currently includes:

- **CameraScreen** (`src/screens/CameraScreen.tsx`): 
  - ✅ Camera capture with `expo-camera` (CameraView)
  - ✅ Base64 image encoding (via `takePictureAsync` with `base64: true`)
  - ✅ SHA-256 hash generation using `expo-crypto`
  - ✅ Photo preview with hash display
  - ✅ Permission handling with `useCameraPermissions` hook
  - ✅ Wallet integration via `useWallet` hook
  - ✅ Cryptographic signing of image hash with wallet
  - ⏳ API service for minting (TODO)
  - ⏳ Secure button functionality (TODO)

The camera screen follows Expo best practices:
- Uses `CameraView` without children (overlay positioned absolutely)
- Uses modern Expo Camera API (avoids deprecated FileSystem methods)
- Proper TypeScript typing throughout

### Smart Contracts Setup

```bash
cd smart-contracts
npm install
```

#### Environment Configuration

Create a `.env` file in `smart-contracts/` directory:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-project-id
SEPOLIA_PRIVATE_KEY=your-private-key
```

#### Development

Compile contracts:
```bash
npx hardhat compile
```

Run tests:
```bash
npx hardhat test
```

Start local Hardhat node:
```bash
npx hardhat node
```

Deploy contracts:
```bash
# Deploy ProofSnap contract to local Hardhat network
npx hardhat run scripts/deploy.ts

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia

# Deploy sample Lock contract (using Ignition)
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

#### Contract Details

The **ProofSnap** contract implements the core media provenance system:

- **Proof Struct**: Stores content hash, timestamp, creator address, location data, and device ID
- **registerMedia()**: Registers a new media proof on-chain (prevents duplicates)
- **getProof()**: Retrieves proof data by content hash
- **proofExists()**: Checks if a proof exists for a given hash
- **MediaRegistered Event**: Emitted when new media is registered

The contract matches the specification in `spec.md` and provides immutable proof storage on Polygon.

## API Endpoints

### Implemented Endpoints
- `GET /` - Welcome message
- `GET /health` - Health check endpoint
- `POST /api/v1/mint` - Core endpoint for minting media proofs
  - **Request Body**: 
    ```json
    {
      "imageBuffer": "base64-encoded-image",
      "walletAddress": "0x...",
      "locationData": "encrypted:lat,lng" (optional),
      "deviceId": "device-identifier" (optional)
    }
    ```
  - **Response**:
    ```json
    {
      "status": "success",
      "ipfsUrl": "https://ipfs.io/ipfs/...",
      "contentHash": "0x...",
      "txHash": "0x...",
      "verificationUrl": "https://proofsnap.app/verify/...",
      "mediaRecord": { ... }
    }
    ```

### Planned Endpoints
- `GET /api/v1/verify/:hash` - Public verification endpoint

## Architecture Overview

### Backend Architecture

The backend follows a modular controller-service pattern:

- **Controllers** (`src/controllers/`): Handle HTTP requests, validate input, and return responses
  - `mintController.ts`: Processes media minting requests

- **Services** (`src/services/`): Contain business logic and external integrations
  - `ipfsService.ts`: Manages Pinata IPFS uploads and URL generation
  - `blockchainService.ts`: Handles smart contract interactions via ethers.js

This separation allows for easy testing, maintenance, and future expansion of the API.

### Storage Architecture

The system follows a hybrid storage model:
- **IPFS**: Stores the actual image files (decentralized)
- **Polygon Blockchain**: Stores cryptographic proofs via ProofSnap contract
  - Content hash (SHA-256 of pixel data)
  - Timestamp (immutable capture time)
  - Creator address (wallet of photographer)
  - Location data (optional encrypted coordinates)
  - Device ID (hashed device identifier)
- **Supabase**: Stores user profiles and off-chain index data for fast querying

### Media Minting Flow

The `/api/v1/mint` endpoint implements the complete provenance flow:

1. **Receive Request**: Backend receives base64 image buffer and wallet address
2. **Generate Hash**: Creates SHA-256 content hash from image pixel data
3. **Upload to IPFS**: Uploads image to Pinata IPFS gateway, receives IPFS hash
4. **Register on Blockchain**: Calls `ProofSnap.registerMedia()` with content hash, location, and device ID
5. **Store in Database**: Creates/updates user record and saves media record with:
   - IPFS hash (for image retrieval)
   - Content hash (for verification)
   - Transaction hash (blockchain proof)
   - Status: VERIFIED
6. **Return Response**: Returns IPFS URL, content hash, transaction hash, and verification URL

The proof is now permanently stored on-chain and can be verified via `getProof()` on the ProofSnap contract.

## Implementation Status

### ✅ Completed

**Backend:**
- Bun + Hono API server setup
- Supabase database integration
- IPFS upload service (Pinata)
- Blockchain service (ethers.js v6)
- `/api/v1/mint` endpoint fully functional
- Media minting flow (IPFS → Blockchain → Database)

**Smart Contracts:**
- ProofSnap contract deployed and tested
- Media provenance system (content hash, timestamp, creator, location, device ID)
- Contract tests passing

**Mobile:**
- Expo project setup with TypeScript
- CameraScreen component implemented
- Camera capture with base64 encoding
- SHA-256 hash generation
- Photo preview UI
- Camera permissions handling
- Expo Camera plugin configured
- Wallet generation and management (useWallet hook)
- Secure wallet key storage with expo-secure-store
- Cryptographic image hash signing with ethers.js
- Wallet UI overlay in HomeScreen

### ⏳ In Progress / TODO

**Mobile:**
- API service (integrate with `/api/v1/mint` endpoint)
- Secure button functionality (connect to minting flow)
- Location services integration
- Device ID generation
- Watermark compositing (React Native Skia)

**Backend:**
- Public verification endpoint (`GET /api/v1/verify/:hash`)

## License

Private project
