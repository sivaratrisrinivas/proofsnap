export class ProofSnapError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ProofSnapError";
  }
}

export class AuthenticationError extends ProofSnapError {
  constructor(message: string, statusCode?: number, public details?: any) {
    super(message, statusCode || 401, "AUTHENTICATION_ERROR");
  }
}

export class ValidationError extends ProofSnapError {
  constructor(message: string, public details?: any) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class NetworkError extends ProofSnapError {
  constructor(message: string, statusCode?: number, public details?: any) {
    super(message, statusCode || 502, "NETWORK_ERROR");
  }
}

export class BlockchainError extends ProofSnapError {
  constructor(message: string, public details?: any) {
    super(message, 500, "BLOCKCHAIN_ERROR");
  }
}

export class StorageError extends ProofSnapError {
  constructor(message: string, public details?: any) {
    super(message, 500, "STORAGE_ERROR");
  }
}
