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

Create `backend/.env` with your credentials (never commit this file):

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# API URL (for verification links)
# For dev: your ngrok URL. For prod: your domain
API_BASE_URL=https://your-subdomain.ngrok-free.app

# IPFS/Pinata
PINATA_JWT=your-pinata-jwt-token

# Blockchain Configuration
BLOCKCHAIN_NETWORK=local  # local | sepolia | amoy | polygon
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
# PRIVATE_KEY=only-needed-for-non-local-networks
```

Required services:
- **Supabase**: For user profiles and media record indexing
- **Pinata**: For IPFS file storage (get JWT token from [Pinata Dashboard](https://app.pinata.cloud))

#### Development (Mobile + Backend)

**1. Start local blockchain:**
```bash
cd smart-contracts && npx hardhat node
```

**2. Deploy contract (new terminal):**
```bash
cd smart-contracts && npx hardhat run scripts/deploy.ts --network localhost
```

**3. Start ngrok tunnel (for mobile access):**
```bash
ngrok http 3000
# Copy the https URL and update API_BASE_URL in backend/.env
```

**4. Start backend (new terminal):**
```bash
cd backend && bun run dev
```

**5. Start mobile (new terminal):**
```bash
cd mobile && npx expo start --tunnel
```

The backend binds to `0.0.0.0:3000` to allow connections from mobile devices via ngrok.

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
  - ✅ API service for minting (complete)
  - ✅ Secure button functionality (uploads to IPFS + blockchain)

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

#### Switching Networks

The backend supports multiple blockchain networks via environment variables:

| Network | BLOCKCHAIN_NETWORK | RPC_URL | Notes |
|---------|-------------------|---------|-------|
| Local | `local` | `http://127.0.0.1:8545` | Hardhat node (no PRIVATE_KEY needed) |
| Sepolia | `sepolia` | Infura/Alchemy URL | Ethereum testnet |
| Amoy | `amoy` | Polygon Amoy RPC | Polygon testnet |
| Polygon | `polygon` | Polygon mainnet RPC | Production |

**To switch networks:**

1. Deploy contract to target network:
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

2. Update `backend/.env`:
   ```bash
   BLOCKCHAIN_NETWORK=sepolia
   RPC_URL=https://sepolia.infura.io/v3/your-key
   CONTRACT_ADDRESS=0x...deployed-address
   PRIVATE_KEY=your-wallet-private-key
   ```

3. Restart backend: `bun run dev`

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
      "signature": "0x..." (optional, but recommended for verification),
      "locationData": "encrypted:lat,lng" (optional),
      "deviceId": "device-identifier" (optional)
    }
    ```
  - **Response**:
    ```json
    {
      "status": "success",
      "ipfsUrl": "https://ipfs.io/ipfs/...",
      "ipfsHash": "...",
      "contentHash": "0x...",
      "txHash": "0x...",
      "verificationUrl": "https://proofsnap.app/api/v1/verify/...",
      "mediaRecord": { ... }
    }
    ```
- `GET /api/v1/verify/:hash` - Public verification endpoint
  - **Response**:
    ```json
    {
      "verified": true,
      "ipfsHash": "...",
      "contentHash": "0x...",
      "blockchainProof": {
        "timestamp": "...",
        "creator": "0x...",
        "txHash": "0x..."
      },
      "mediaRecord": { ... }
    }
    ```

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

1. **Receive Request**: Backend receives base64 image buffer, wallet address, and cryptographic signature
2. **Verify Signature**: Validates the signature against the wallet address and content hash (ensures authenticity)
3. **Generate Hash**: Creates SHA-256 content hash from base64 string (matches mobile hashing method)
4. **Upload to IPFS**: Uploads decoded image buffer to Pinata IPFS gateway, receives IPFS hash
5. **Register on Blockchain**: Calls `ProofSnap.registerMedia()` with content hash, location, and device ID
6. **Store in Database**: Creates/updates user record and saves media record with:
   - IPFS hash (for image retrieval)
   - Content hash (for verification)
   - Transaction hash (blockchain proof)
   - Status: VERIFIED
7. **Return Response**: Returns IPFS URL, content hash, transaction hash, and verification URL

The proof is now permanently stored on-chain and can be verified via `getProof()` on the ProofSnap contract.

## Implementation Status

### ✅ Completed

**Backend:**
- Bun + Hono API server setup
- Supabase database integration
- IPFS upload service (Pinata)
- Blockchain service (ethers.js v6)
- `/api/v1/mint` endpoint fully functional
- `/api/v1/verify/:hash` endpoint for public verification
- Cryptographic signature verification (ethers.js `verifyMessage`)
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
- API service for minting photos
- Full upload integration (IPFS + Blockchain + Database)
- Gallery view with AsyncStorage persistence
- Native share functionality with verification links
- Success screen with transaction details

### ⏳ In Progress / TODO

**Mobile:**
- Location services integration
- Device ID generation
- Enhanced watermark compositing (React Native Skia for high-performance rendering)

**Backend:**
- Production deployment configuration

## License

Private project
