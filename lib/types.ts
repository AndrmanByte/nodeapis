// 用户类型
export interface User {
  id: string
  email: string
  username?: string
  avatar_url?: string
  role: 'user' | 'merchant' | 'admin'
  auth_provider: string
  points: number
  level: number
  exp: number
  total_checkins: number
  consecutive_checkins: number
  last_checkin_date?: string
  created_at: string
  updated_at: string
}

// 等级配置
export interface Level {
  level: number
  name: string
  min_exp: number
  icon: string
  color: string
  checkin_bonus: number
  lottery_discount: number
}

// 积分记录
export interface PointRecord {
  id: string
  user_id: string
  amount: number
  balance: number
  type: 'checkin' | 'lottery' | 'lottery_win' | 'admin_adjust' | 'submit_provider' | 'referral' | 'activity'
  description?: string
  related_id?: string
  created_at: string
}

// 签到记录
export interface CheckinRecord {
  id: string
  user_id: string
  checkin_date: string
  points_earned: number
  is_consecutive: boolean
  consecutive_days: number
  created_at: string
}

// 签到奖励配置
export const CHECKIN_REWARDS = {
  base: 10, // 基础积分
  consecutive: [
    { days: 7, bonus: 20 },   // 连续7天额外+20
    { days: 14, bonus: 50 },  // 连续14天额外+50
    { days: 30, bonus: 100 }, // 连续30天额外+100
  ],
  exp: 5 // 每次签到获得经验
}

// 厂商
export interface Vendor {
  id: string
  name: string
  icon: string
  sort_order: number
  is_active: boolean
  created_at: string
}

// 中转站/服务商类型
export interface Provider {
  id: string
  owner_id?: string
  name: string
  description: string
  website: string
  api_url?: string
  logo_url?: string
  screenshot_url?: string
  status: 'online' | 'offline' | 'maintenance'
  uptime: number
  rating: number
  features: string[]
  supported_models: string[]
  supported_vendors: string[]
  pricing: PricingTier[]
  register_type?: string
  contact?: string
  min_deposit?: string
  payment_methods?: string[]
  free_trial?: boolean
  advantages?: string[]
  created_at: string
  updated_at: string
  is_verified: boolean
  is_featured: boolean
}

export interface PricingTier {
  model: string
  input_price: number
  output_price: number
}

export interface ProviderInput {
  name: string
  description: string
  website: string
  api_url?: string
  logo_url?: string
  screenshot_url?: string
  status?: 'online' | 'offline' | 'maintenance'
  uptime?: number
  rating?: number
  features?: string[]
  supported_models?: string[]
  supported_vendors?: string[]
  pricing?: PricingTier[]
  register_type?: string
  contact?: string
  min_deposit?: string
  payment_methods?: string[]
  free_trial?: boolean
  advantages?: string[]
  is_verified?: boolean
  is_featured?: boolean
}

// 提交记录
export interface ProviderSubmission {
  id: string
  user_id?: string
  name: string
  description?: string
  website: string
  api_url?: string
  logo_url?: string
  screenshot_url?: string
  contact_email?: string
  contact?: string
  supported_models: string[]
  supported_vendors?: string[]
  pricing?: PricingTier[]
  features?: string[]
  register_type?: string
  min_deposit?: string
  payment_methods?: string[]
  free_trial?: boolean
  advantages?: string[]
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  review_notes?: string
}

// 模型管理
export interface Model {
  id: string
  name: string
  provider: string
  model_id: string
  category: string
  is_active: boolean
  sort_order: number
  created_at: string
}

// 抽奖活动
export interface LotteryEvent {
  id: string
  title: string
  description?: string
  provider_id?: string
  provider?: Provider
  prize: string
  prize_image?: string
  points_cost: number
  max_participants: number
  current_participants: number
  winner_count: number
  start_time: string
  end_time: string
  status: 'draft' | 'active' | 'ended' | 'drawn'
  created_at: string
}

// 抽奖参与者
export interface LotteryParticipant {
  id: string
  event_id: string
  user_id: string
  user?: User
  points_spent: number
  is_winner: boolean
  participated_at: string
}

// 通知
export interface Notification {
  id: string
  user_id: string
  title: string
  content?: string
  type: 'system' | 'lottery' | 'points' | 'submission' | 'announcement'
  link?: string
  is_read: boolean
  created_at: string
}

// 公告
export interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'event'
  is_pinned: boolean
  is_active: boolean
  start_time: string
  end_time?: string
  created_at: string
  updated_at: string
}

// 管理员用户
export interface AdminUser {
  id: string
  email: string
  created_at: string
}

// 广告/赞助位
export interface Advertisement {
  id: string
  title: string
  description: string
  logo_url: string
  link: string
  link_type: 'internal' | 'external'
  placement: 'home_top' | 'home_featured' | 'detail_sidebar' | 'detail_bottom'
  sort_order: number
  is_active: boolean
  btn_text: string
  start_time?: string
  end_time?: string
  provider_id?: string
  created_at: string
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// 模型信息
export interface ModelInfo {
  id: string
  name: string
  provider: string
  description: string
  icon?: string
}

// 常用模型列表
// 用户建议
export interface Suggestion {
  id: string
  user_id: string | null
  title: string
  content: string
  category: 'general' | 'feature' | 'bug' | 'improvement' | 'other'
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'completed'
  admin_reply: string | null
  replied_at: string | null
  created_at: string
  updated_at: string
  user?: User
}

export const SUGGESTION_CATEGORIES = [
  { value: 'general', label: '综合建议' },
  { value: 'feature', label: '功能需求' },
  { value: 'bug', label: '问题反馈' },
  { value: 'improvement', label: '体验改进' },
  { value: 'other', label: '其他' },
]

export const SUGGESTION_STATUS = [
  { value: 'pending', label: '待处理', color: 'text-yellow-500' },
  { value: 'reviewing', label: '处理中', color: 'text-blue-500' },
  { value: 'accepted', label: '已采纳', color: 'text-green-500' },
  { value: 'rejected', label: '已拒绝', color: 'text-red-500' },
  { value: 'completed', label: '已完成', color: 'text-purple-500' },
]

export const POPULAR_MODELS: ModelInfo[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: '最新的GPT-4多模态模型' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', description: '高性能GPT-4模型' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', description: '快速经济的对话模型' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', description: '最强大的Claude模型' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', description: '平衡性能与速度' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', description: '快速响应的轻量模型' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', description: 'Google最新AI模型' },
  { id: 'gemini-ultra', name: 'Gemini Ultra', provider: 'Google', description: 'Google旗舰AI模型' },
  { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'Meta', description: 'Meta开源大模型' },
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', description: 'Mistral旗舰模型' },
]

// 等级图标映射
export const LEVEL_ICONS: Record<number, string> = {
  1: 'Sprout',
  2: 'Leaf',
  3: 'TreeDeciduous',
  4: 'Star',
  5: 'Crown',
  6: 'Trophy',
  7: 'Gem'
}

// 等级颜色映射
export const LEVEL_COLORS: Record<number, string> = {
  1: 'text-gray-500',
  2: 'text-green-500',
  3: 'text-blue-500',
  4: 'text-purple-500',
  5: 'text-yellow-500',
  6: 'text-orange-500',
  7: 'text-red-500'
}
