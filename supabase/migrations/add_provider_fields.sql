-- 为 providers 表添加缺失的字段
-- 在 Supabase Dashboard -> SQL Editor 中执行此脚本

-- 添加 short_description 字段
ALTER TABLE providers ADD COLUMN IF NOT EXISTS short_description VARCHAR(500);

-- 添加 screenshot_url 字段
ALTER TABLE providers ADD COLUMN IF NOT EXISTS screenshot_url VARCHAR(500);

-- 添加 api_url 字段
ALTER TABLE providers ADD COLUMN IF NOT EXISTS api_url VARCHAR(500);

-- 添加 contact_email 字段
ALTER TABLE providers ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);

-- 添加 contact 字段
ALTER TABLE providers ADD COLUMN IF NOT EXISTS contact VARCHAR(255);

-- 添加 register_type 字段
ALTER TABLE providers ADD COLUMN IF NOT EXISTS register_type VARCHAR(50) DEFAULT '开放注册';

-- 添加 min_deposit 字段
ALTER TABLE providers ADD COLUMN IF NOT EXISTS min_deposit VARCHAR(100);

-- 添加 payment_methods 字段
ALTER TABLE providers ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT '{}';

-- 添加 advantages 字段
ALTER TABLE providers ADD COLUMN IF NOT EXISTS advantages TEXT[] DEFAULT '{}';

-- 添加 supported_vendors 字段
ALTER TABLE providers ADD COLUMN IF NOT EXISTS supported_vendors TEXT[] DEFAULT '{}';

-- 添加 free_trial 字段
ALTER TABLE providers ADD COLUMN IF NOT EXISTS free_trial BOOLEAN DEFAULT false;
