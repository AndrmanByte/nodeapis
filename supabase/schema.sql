-- Supabase SQL Schema for NodeAPIs
-- 在 Supabase Dashboard -> SQL Editor 中执行此脚本

-- ==================== 基础表 ====================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100),
  avatar_url VARCHAR(500),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'merchant', 'admin')),
  auth_provider VARCHAR(50) DEFAULT 'email',
  -- 积分等级系统
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  -- 签到相关
  total_checkins INTEGER DEFAULT 0,
  consecutive_checkins INTEGER DEFAULT 0,
  last_checkin_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 管理员表 (支持密码登录和OAuth登录)
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  auth_provider VARCHAR(50) DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== 等级配置表 ====================

CREATE TABLE IF NOT EXISTS levels (
  level INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  min_exp INTEGER NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(20),
  -- 等级特权
  checkin_bonus INTEGER DEFAULT 0,  -- 签到积分加成
  lottery_discount INTEGER DEFAULT 0 -- 抽奖积分折扣百分比
);

-- 插入等级配置
INSERT INTO levels (level, name, min_exp, icon, color, checkin_bonus, lottery_discount) VALUES
(1, '新手', 0, 'Sprout', 'gray', 0, 0),
(2, '初级', 100, 'Leaf', 'green', 1, 0),
(3, '中级', 500, 'TreeDeciduous', 'blue', 2, 5),
(4, '高级', 1500, 'Star', 'purple', 3, 10),
(5, '专家', 3500, 'Crown', 'yellow', 5, 15),
(6, '大师', 7000, 'Trophy', 'orange', 8, 20),
(7, '传奇', 15000, 'Gem', 'red', 10, 25)
ON CONFLICT (level) DO NOTHING;

-- ==================== 积分记录表 ====================

CREATE TABLE IF NOT EXISTS point_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- 正数增加，负数减少
  balance INTEGER NOT NULL, -- 操作后余额
  type VARCHAR(30) NOT NULL CHECK (type IN ('checkin', 'lottery', 'lottery_win', 'admin_adjust', 'submit_provider', 'referral', 'activity')),
  description TEXT,
  related_id UUID, -- 关联的活动/中转站ID等
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== 签到记录表 ====================

CREATE TABLE IF NOT EXISTS checkin_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  points_earned INTEGER NOT NULL,
  is_consecutive BOOLEAN DEFAULT false,
  consecutive_days INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);

-- ==================== 中转站/服务商表 ====================

CREATE TABLE IF NOT EXISTS providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website VARCHAR(500) NOT NULL,
  logo_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
  uptime DECIMAL(5,2) DEFAULT 99.9,
  rating DECIMAL(2,1) DEFAULT 4.5 CHECK (rating >= 1 AND rating <= 5),
  features TEXT[] DEFAULT '{}',
  supported_models TEXT[] DEFAULT '{}',
  pricing JSONB DEFAULT '[]',
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== 中转站提交申请表 ====================

CREATE TABLE IF NOT EXISTS provider_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website VARCHAR(500) NOT NULL,
  contact_email VARCHAR(255),
  supported_models TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT
);

-- ==================== 抽奖活动表 ====================

CREATE TABLE IF NOT EXISTS lottery_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  prize VARCHAR(255) NOT NULL,
  prize_image VARCHAR(500),
  -- 积分消耗
  points_cost INTEGER DEFAULT 0,
  max_participants INTEGER DEFAULT 100,
  current_participants INTEGER DEFAULT 0,
  winner_count INTEGER DEFAULT 1,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended', 'drawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== 抽奖参与者表 ====================

CREATE TABLE IF NOT EXISTS lottery_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES lottery_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points_spent INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT false,
  participated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ==================== 通知表 ====================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(30) DEFAULT 'system' CHECK (type IN ('system', 'lottery', 'points', 'submission', 'announcement')),
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== 公告表 ====================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(30) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'event')),
  is_pinned BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== 触发器函数 ====================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 计算用户等级
CREATE OR REPLACE FUNCTION calculate_level(user_exp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  user_level INTEGER := 1;
BEGIN
  SELECT COALESCE(MAX(level), 1) INTO user_level
  FROM levels
  WHERE min_exp <= user_exp;
  RETURN user_level;
END;
$$ language 'plpgsql';

-- 用户经验更新时自动计算等级
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level = calculate_level(NEW.exp);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ==================== 触发器 ====================

DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_level_trigger ON users;
CREATE TRIGGER update_user_level_trigger
  BEFORE UPDATE OF exp ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================== 索引 ====================

CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);
CREATE INDEX IF NOT EXISTS idx_providers_is_featured ON providers(is_featured);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_providers_owner ON providers(owner_id);
CREATE INDEX IF NOT EXISTS idx_provider_submissions_status ON provider_submissions(status);
CREATE INDEX IF NOT EXISTS idx_provider_submissions_user ON provider_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_lottery_events_status ON lottery_events(status);
CREATE INDEX IF NOT EXISTS idx_lottery_participants_event ON lottery_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_lottery_participants_user ON lottery_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_point_records_user ON point_records(user_id);
CREATE INDEX IF NOT EXISTS idx_checkin_records_user ON checkin_records(user_id);
CREATE INDEX IF NOT EXISTS idx_checkin_records_date ON checkin_records(checkin_date);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);
CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC);

-- ==================== Row Level Security ====================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "Allow public read providers" ON providers FOR SELECT USING (true);
CREATE POLICY "Allow public read lottery_events" ON lottery_events FOR SELECT USING (true);
CREATE POLICY "Allow public read announcements" ON announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read levels" ON levels FOR SELECT USING (true);

-- 用户自己的数据
CREATE POLICY "Users read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users read own point_records" ON point_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own checkin_records" ON checkin_records FOR SELECT USING (auth.uid() = user_id);

-- 认证用户完全访问
CREATE POLICY "Authenticated full access providers" ON providers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access lottery_events" ON lottery_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access announcements" ON announcements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access users" ON users FOR ALL USING (auth.role() = 'authenticated');

-- 提交申请
CREATE POLICY "Allow insert submissions" ON provider_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated full access submissions" ON provider_submissions FOR ALL USING (auth.role() = 'authenticated');

-- 抽奖参与
CREATE POLICY "Allow insert lottery_participants" ON lottery_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow read lottery_participants" ON lottery_participants FOR SELECT USING (true);

-- 用户建议表
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general', -- general, feature, bug, improvement, other
  status VARCHAR(20) DEFAULT 'pending', -- pending, reviewing, accepted, rejected, completed
  admin_reply TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suggestions_user ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_suggestions_category ON suggestions(category);

-- ==================== 免费试用活动表 ====================

CREATE TABLE IF NOT EXISTS trial_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  amount VARCHAR(100) NOT NULL,           -- "$5", "100万Token", "¥10"
  description TEXT,                        -- "新用户注册即送"
  points_cost INTEGER DEFAULT 0,           -- 领取所需积分，0为免费
  is_active BOOLEAN DEFAULT true,
  highlight_order INTEGER DEFAULT 0,       -- 排序权重，越大越靠前
  expires_at TIMESTAMP WITH TIME ZONE,     -- 过期时间
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 兑换码表
CREATE TABLE IF NOT EXISTS trial_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trial_offer_id UUID NOT NULL REFERENCES trial_offers(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'claimed')),
  claimed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trial_offers_provider ON trial_offers(provider_id);
CREATE INDEX IF NOT EXISTS idx_trial_offers_active ON trial_offers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_trial_offers_order ON trial_offers(highlight_order DESC);
CREATE INDEX IF NOT EXISTS idx_trial_codes_offer ON trial_codes(trial_offer_id);
CREATE INDEX IF NOT EXISTS idx_trial_codes_status ON trial_codes(trial_offer_id, status);

ALTER TABLE trial_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read trial_offers" ON trial_offers FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated full access trial_offers" ON trial_offers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow public read trial_codes" ON trial_codes FOR SELECT USING (true);
CREATE POLICY "Authenticated update trial_codes" ON trial_codes FOR UPDATE USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_trial_offers_updated_at ON trial_offers;
CREATE TRIGGER update_trial_offers_updated_at
  BEFORE UPDATE ON trial_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 原子领取兑换码函数（防超卖）
CREATE OR REPLACE FUNCTION claim_trial_code(
  p_trial_offer_id UUID,
  p_user_id UUID
)
RETURNS TABLE(code TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE trial_codes
  SET status = 'claimed',
      claimed_by = p_user_id,
      claimed_at = NOW()
  WHERE id = (
    SELECT tc.id
    FROM trial_codes tc
    WHERE tc.trial_offer_id = p_trial_offer_id
      AND tc.status = 'available'
    ORDER BY tc.created_at
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING trial_codes.code;
END;
$$;

-- ==================== 示例数据 ====================

INSERT INTO providers (name, description, website, status, uptime, rating, features, supported_models, pricing, is_verified, is_featured) VALUES
(
  'OpenRouter',
  '聚合多家AI提供商的统一API接口，支持100+模型',
  'https://openrouter.ai',
  'online',
  99.9,
  4.8,
  ARRAY['统一API格式', '按需计费', '多模型支持', '负载均衡'],
  ARRAY['gpt-4o', 'gpt-4-turbo', 'claude-3-opus', 'claude-3-sonnet', 'gemini-pro'],
  '[{"model": "gpt-4o", "input_price": 5.0, "output_price": 15.0}, {"model": "claude-3-opus", "input_price": 15.0, "output_price": 75.0}]'::jsonb,
  true,
  true
),
(
  'OneAPI',
  '开源的OpenAI API管理分发系统，支持多种大模型',
  'https://github.com/songquanpeng/one-api',
  'online',
  98.5,
  4.6,
  ARRAY['开源免费', '多渠道管理', '额度控制', '流量分发'],
  ARRAY['gpt-4o', 'gpt-3.5-turbo', 'claude-3-sonnet', 'gemini-pro', 'llama-3-70b'],
  '[{"model": "gpt-4o", "input_price": 4.5, "output_price": 13.5}, {"model": "gpt-3.5-turbo", "input_price": 0.5, "output_price": 1.5}]'::jsonb,
  true,
  true
),
(
  'API2D',
  '稳定可靠的AI API代理服务，支持支付宝微信充值',
  'https://api2d.com',
  'online',
  99.5,
  4.7,
  ARRAY['国内直连', '支付便捷', '响应快速', '技术支持'],
  ARRAY['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus'],
  '[{"model": "gpt-4o", "input_price": 6.0, "output_price": 18.0}, {"model": "gpt-3.5-turbo", "input_price": 0.8, "output_price": 2.0}]'::jsonb,
  true,
  false
)
ON CONFLICT DO NOTHING;

-- 默认管理员
INSERT INTO admins (email, password_hash, auth_provider) VALUES
('admin@nodeapis.xyz', '$2a$10$XQxBtJXKQZPHJVL.Y5J5/.OJZz0LsUHKYVZYR.5YKz5L5Y5Y5Y5Y5', 'email')
ON CONFLICT (email) DO NOTHING;

-- ==================== 数据库更新 ====================

-- 添加一句话描述字段
ALTER TABLE providers ADD COLUMN IF NOT EXISTS short_description TEXT DEFAULT '';
ALTER TABLE provider_submissions ADD COLUMN IF NOT EXISTS short_description TEXT DEFAULT '';

-- 添加积分消耗字段（试用活动）
ALTER TABLE trial_offers ADD COLUMN IF NOT EXISTS points_cost INTEGER DEFAULT 0;
