/** 应用常量定义 */

// ==================== 文件上传限制 ====================

/** 头像文件最大大小：5MB */
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024

/** 支持的头像格式 */
export const AVATAR_ACCEPT_TYPES = 'image/jpeg,image/png,image/gif,image/webp'

// ==================== 表单验证限制 ====================

/** 用户名最大长度 */
export const MAX_USERNAME_LENGTH = 20

/** 密码最小长度 */
export const MIN_PASSWORD_LENGTH = 6

/** 密码最大长度 */
export const MAX_PASSWORD_LENGTH = 20

/** 手机号长度 */
export const PHONE_LENGTH = 11

/** 验证码长度 */
export const VERIFICATION_CODE_LENGTH = 6

/** 验证码倒计时（秒） */
export const VERIFICATION_CODE_COUNTDOWN = 60

// ==================== 分页配置 ====================

/** 默认每页条数 */
export const DEFAULT_PAGE_SIZE = 10

// ==================== API 配置 ====================

/** 请求超时时间（毫秒） */
export const API_TIMEOUT = 15_000

/** 搜索防抖延迟（毫秒） */
export const SEARCH_DEBOUNCE_DELAY = 300

/** SSE 重连延迟（毫秒） */
export const SSE_RECONNECT_DELAY = 300

// ==================== 错误边界 ====================

/** 错误边界最大重试次数 */
export const ERROR_BOUNDARY_MAX_RETRIES = 3

// ==================== Toast 配置 ====================

/** Toast 默认显示时长（毫秒） */
export const TOAST_DEFAULT_DURATION = 2500
