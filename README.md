# ProofSnap

A modern backend API built with Hono and Bun.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- **Framework**: [Hono](https://hono.dev) - Ultrafast web framework
- **Language**: TypeScript
- **Validation**: Zod with `@hono/zod-validator`

## Project Structure

```
proofsnap/
├── backend/
│   ├── index.ts          # Main application entry point
│   ├── package.json      # Dependencies and scripts
│   └── tsconfig.json     # TypeScript configuration
└── README.md
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed (v1.2.23+)

### Installation

```bash
cd backend
bun install
```

### Development

Run the development server with hot reload:

```bash
bun run dev
```

The server will start and watch for file changes.

### Type Checking

Run TypeScript type checking:

```bash
bun run typecheck
```

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint

## License

Private project
