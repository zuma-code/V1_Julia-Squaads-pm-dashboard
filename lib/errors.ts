// Custom error classes for better error handling
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`)
    this.name = 'NotFoundError'
  }
}

export class BusinessLogicError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BusinessLogicError'
  }
}

export class StoreError extends Error {
  constructor(message: string, public operation: string) {
    super(message)
    this.name = 'StoreError'
  }
}

// Error handler utility
export function handleError(error: unknown): { message: string; type: string } {
  if (error instanceof ValidationError) {
    return { message: error.message, type: 'validation' }
  }
  
  if (error instanceof NotFoundError) {
    return { message: error.message, type: 'not_found' }
  }
  
  if (error instanceof BusinessLogicError) {
    return { message: error.message, type: 'business_logic' }
  }
  
  if (error instanceof StoreError) {
    return { message: `Store operation failed: ${error.message}`, type: 'store' }
  }
  
  console.error('Unexpected error:', error)
  return { message: 'An unexpected error occurred', type: 'unknown' }
}