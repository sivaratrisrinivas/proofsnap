# AGENTS.md

## Build/Lint/Test Commands
- **Backend**: `cd backend && bun install && bun run dev` (dev), `bun run typecheck` (typecheck)
- **Mobile**: `cd mobile && bun install && bun run start` (dev), `bun run android|ios|web` (platforms)
- **Smart Contracts**: `cd smart-contracts && npm install`, `npx hardhat compile`, `npx hardhat test` (all tests), `npx hardhat test test/ProofSnap.ts` (single test file) 

## Architecture
Monorepo with three subprojects:
- **backend/**: Bun + Hono API (TypeScript). Controllers in `src/controllers/`, services in `src/services/`. Uses Supabase (PostgreSQL), IPFS via Pinata, ethers.js for blockchain.
- **mobile/**: React Native + Expo app (TypeScript). Main entry: `App.tsx`. Uses expo-camera, expo-crypto, expo-file-system.
- **smart-contracts/**: Hardhat + Solidity 0.8.28. Main contract: `contracts/ProofSnap.sol`. Tests in `test/`, deploy scripts in `scripts/`.

## Code Style
- **Language**: TypeScript throughout (except Solidity for contracts)
- **Imports**: ES modules (`import/export`), no CommonJS in backend/mobile
- **Validation**: Zod with `@hono/zod-validator` for API validation
- **Naming**: camelCase for functions/variables, PascalCase for components/types
- **Error Handling**: Return proper HTTP status codes with JSON responses in backend
- **Config**: Use `bunfig.toml` for backend env vars, `.env` for smart-contracts
