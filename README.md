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
- **Storage**: IPFS (via Pinata API) - Decentralized file storage

### Mobile (The "Super Normal" Interface)
- **Framework**: [Expo](https://expo.dev) - React Native framework
- **Runtime**: React Native 0.81.5
- **React**: 19.1.0
- **Language**: TypeScript
- **Architecture**: New Architecture enabled
- **Key Libraries**:
  - `expo-camera`: For capturing media
  - `expo-file-system`: For local file manipulation
  - `ethers` (v6): For wallet creation and blockchain interaction
  - `skia` (React Native Skia): For high-performance watermark compositing

### Smart Contracts (The Trust Layer)
- **Blockchain**: Polygon (PoS) - Low fees, fast finality
- **Framework**: [Hardhat](https://hardhat.org) - Development environment for Ethereum
- **Language**: Solidity 0.8.28
- **Testing**: Hardhat with TypeScript

## Project Structure

```
proofsnap/
├── backend/                # Bun + Hono API
│   ├── index.ts            # Main application entry point
│   ├── package.json        # Dependencies and scripts
│   ├── tsconfig.json       # TypeScript configuration
│   ├── bunfig.toml         # Bun environment configuration
│   └── test-db.ts          # Supabase database test utility
├── mobile/                 # React Native + Expo
│   ├── App.tsx             # Main React Native component
│   ├── index.ts            # App entry point
│   ├── app.json            # Expo configuration
│   ├── package.json        # Dependencies and scripts
│   └── tsconfig.json       # TypeScript configuration
├── smart-contracts/        # Hardhat project
│   ├── contracts/          # Solidity smart contracts
│   ├── test/               # Contract tests
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

Configure Supabase credentials in `backend/bunfig.toml`:

```toml
[env]
SUPABASE_URL = "your-supabase-url"
SUPABASE_ANON_KEY = "your-supabase-anon-key"
```

#### Development

Run the development server with hot reload:

```bash
bun run dev
```

The server will start and watch for file changes.

#### Database Testing

Test Supabase connection:

```bash
bun run test-db.ts
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

### Smart Contracts Setup

```bash
cd smart-contracts
npm install
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
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

## API Endpoints

### Current Endpoints
- `GET /` - Welcome message
- `GET /health` - Health check endpoint

### Planned Endpoints (from spec)
- `POST /api/v1/mint` - Core endpoint for minting media proofs
- `GET /api/v1/verify/:hash` - Public verification endpoint

## Architecture Overview

The system follows a hybrid storage model:
- **IPFS**: Stores the actual image files (decentralized)
- **Polygon Blockchain**: Stores cryptographic proofs (content hash, timestamp, creator)
- **Supabase**: Stores user profiles and off-chain index data for fast querying

## License

Private project
