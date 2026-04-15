/** 统一错误处理工具 */

/**
 * 处理运行时错误
 * @param error - 错误对象
 * @param context - 错误上下文（用于日志标识）
 */
export function handleError(error: unknown, context: string): void {
  if (error instanceof Error) {
    console.error(`[${context}]`, error.message, error.stack)
  } else {
    console.error(`[${context}]`, String(error))
  }
}

/**
 * 安全的异步执行包装器
 * 自动捕获错误并记录日志
 * @param promise - Promise 对象
 * @param context - 错误上下文
 * @returns [error, data] 元组
 */
export async function safeExecute<T>(
  promise: Promise<T>,
  context: string,
): Promise<[Error | null, T | null]> {
  try {
    const data = await promise
    return [null, data]
  } catch (error) {
    handleError(error, context)
    return [error instanceof Error ? error : new Error(String(error)), null]
  }
}

/**
 * 用户友好的错误消息提取
 * @param error - 错误对象
 * @param fallback - 默认消息
 */
export function getUserErrorMessage(
  error: unknown,
  fallback = '操作失败，请稍后重试',
): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}
