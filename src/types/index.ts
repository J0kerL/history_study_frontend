// ==================== 通用分页结果 ====================

export interface PageResult<T> {
  pageNum: number
  pageSize: number
  total: number
  pages: number
  list: T[]
  hasNext: boolean
  hasPrevious: boolean
}

// ==================== 收藏相关 ====================

/** 用户收藏列表响应对象 */
export interface FavoriteVO {
  /** 收藏记录ID */
  id: number
  /** 收藏类型：1-事件，2-人物 */
  type: number
  /** 关联对象ID */
  refId: number
  /** 关联对象标题（事件）或姓名（人物） */
  refTitle: string
  /** 关联对象图片URL */
  refImage: string
  /** 关联对象摘要（事件）或副标题（人物） */
  refSummary: string
}

// ==================== 成就相关 ====================

/** 成就定义实体 */
export interface Achievement {
  id: number
  code: string
  name: string
  description: string
  /** 成就图标地址 */
  iconUrl: string
  /** 解锁条件类型：1-连续登录，2-累计答题，3-累计收藏，4-正确率 */
  conditionType: number
  conditionValue: number
}

// ==================== 认证相关 ====================

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: CurrentUser
}

export interface RegisterRequest {
  username: string
  password: string
  confirmPassword: string
  phone: string
  verificationCode: string
}

/** 修改密码请求（对应后端 /user/password 接口） */
export interface UpdatePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmNewPassword: string
}

// ==================== 历史事件类型 ====================

/** 事件摘要（对应后端 EventSummaryVO） */
export interface EventSummaryVO {
  id: number
  year: number
  title: string
  summary: string
  imageUrl: string
}

/** 今日事件接口响应（后端返回 data 结构） */
export interface TodayEventsResponse {
  /** 事件列表 */
  events: EventSummaryVO[]
  /** 生成状态：ready=已就绪，generating=生成中 */
  generationStatus: 'ready' | 'generating'
  /** 生成提示信息 */
  generationMessage?: string
}

/** 事件详情（对应后端 EventDetailVO） */
export interface EventDetailVO {
  id: number
  title: string
  year: number
  month: number
  day: number
  summary: string
  content: string
  imageUrl: string
  tags: string
  source: number
  relatedEvents: EventSummaryVO[]
  /** 关联事件生成状态：ready=已就绪，generating=生成中 */
  relatedEventsStatus?: 'ready' | 'generating'
  /** 关联事件生成提示信息 */
  relatedEventsMessage?: string
}

// 每日一题（后端 TodayQuizVO）
export interface TodayQuiz {
  id: number
  question: string
  quizType: number  // 1-单选，2-多选
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  difficulty: number // 1-简单，2-中等，3-困难
  answered: boolean
  // 已答时返回的详情字段
  correctOptions?: string   // 正确答案，如 "A" 或 "AB"
  selectedOptions?: string  // 用户当时选择的答案
  correct?: boolean         // 是否答对
  explanation?: string      // 答案解析
}

// 答题结果（后端 QuizAnswerResultVO）
export interface QuizAnswerResult {
  quizId: number
  correctOptions: string
  selectedOptions: string
  correct: boolean
  explanation: string
}

// 学习统计（后端 QuizStatsVO）
export interface QuizStats {
  streakDays: number
  maxStreakDays: number
  totalQuizCount: number
  correctQuizCount: number
  accuracyRate: number // 百分比，保留1位小数
}

// 历史答题记录（后端 QuizHistoryVO）
export interface QuizHistory {
  answerDate: string
  question: string
  quizType: number
  correctOptions: string
  selectedOptions: string
  correct: boolean
}

// 前端 UI 使用的选项类型
export interface QuizOption {
  id: number
  label: string  // 'A', 'B', 'C', 'D'
  text: string
}

// 用户学习统计
export interface UserStats {
  streak: number
  totalQuestions: number
  correctRate: number
}

// 推荐内容
export interface RecommendedContent {
  id: string
  title: string
  subtitle: string
  time: string
  location: string
  image: string
  body: string
}

// 搜索建议
export interface SearchSuggestion {
  type: 'recent' | 'trending'
  text: string
}

// 后端 /user/current 返回的用户信息（对应 History 后端 User 实体）
export interface CurrentUser {
  id: number
  username: string
  phone: string
  avatar: string
  registerDate: string
  streakDays: number
  maxStreakDays: number
  totalQuizCount: number
  correctQuizCount: number
  status: number
}
