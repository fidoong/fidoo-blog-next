/**
 * 应用错误基类
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * 404 错误
 */
export class NotFoundError extends AppError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string = '资源未找到', details?: any) {
    super(message, 'NOT_FOUND', 404, details)
    this.name = 'NotFoundError'
  }
}

/**
 * 401 错误
 */
export class UnauthorizedError extends AppError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string = '未授权，请先登录', details?: any) {
    super(message, 'UNAUTHORIZED', 401, details)
    this.name = 'UnauthorizedError'
  }
}

/**
 * 403 错误
 */
export class ForbiddenError extends AppError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string = '权限不足', details?: any) {
    super(message, 'FORBIDDEN', 403, details)
    this.name = 'ForbiddenError'
  }
}

/**
 * 400 错误
 */
export class ValidationError extends AppError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string = '验证失败', details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

/**
 * 409 错误
 */
export class ConflictError extends AppError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string = '资源冲突', details?: any) {
    super(message, 'CONFLICT', 409, details)
    this.name = 'ConflictError'
  }
}

/**
 * 统一错误处理
 */
export function handleError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return '未知错误，请稍后重试'
}

/**
 * 判断是否为特定类型的错误
 */
export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError
}

export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}
