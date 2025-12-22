# ProofSnap

A modern full-stack application with backend API and mobile app.

## Tech Stack

### Backend
- **Runtime**: [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- **Framework**: [Hono](https://hono.dev) - Ultrafast web framework
- **Language**: TypeScript
- **Validation**: Zod with `@hono/zod-validator`

### Mobile
- **Framework**: [Expo](https://expo.dev) - React Native framework
- **Runtime**: React Native 0.81.5
- **React**: 19.1.0
- **Language**: TypeScript
- **Architecture**: New Architecture enabled

## Project Structure

```
proofsnap/
├── backend/
│   ├── index.ts          # Main application entry point
│   ├── package.json      # Dependencies and scripts
│   └── tsconfig.json     # TypeScript configuration
├── mobile/
│   ├── App.tsx           # Main React Native component
│   ├── index.ts          # App entry point
│   ├── app.json          # Expo configuration
│   ├── package.json      # Dependencies and scripts
│   └── tsconfig.json     # TypeScript configuration
└── README.md
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed (v1.2.23+)
- [Node.js](https://nodejs.org/) (for Expo CLI)
- [Expo Go](https://expo.dev/client) app on your mobile device (optional)

### Backend Setup

```bash
cd backend
bun install
```

#### Development

Run the development server with hot reload:

```bash
bun run dev
```

The server will start and watch for file changes.

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

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint

## License

Private project
