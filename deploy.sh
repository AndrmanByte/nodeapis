#!/bin/bash

# NodeAPIs 部署脚本
# 用于 Ubuntu 服务器的快速部署

set -e

echo "=============================="
echo "NodeAPIs 部署脚本"
echo "=============================="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "正在安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "Docker 安装完成，请重新登录后再运行此脚本"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "正在安装 Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 创建 .env.local 文件（如果不存在）
if [ ! -f .env.local ]; then
    echo "创建 .env.local 配置文件..."
    cp .env.example .env.local
    echo ""
    echo "请编辑 .env.local 文件，填入你的 Supabase 配置："
    echo "  nano .env.local"
    echo ""
    echo "填写完成后，再次运行此脚本"
    exit 0
fi

# 检查必要的环境变量
source .env.local
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" == "https://your-project.supabase.co" ]; then
    echo "错误: 请在 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" == "your-anon-key" ]; then
    echo "错误: 请在 .env.local 中配置 NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

echo "配置检查通过！"
echo ""

# 选择部署模式
echo "请选择部署模式："
echo "1. 简单部署 (仅应用，使用 Supabase 云数据库)"
echo "2. 完整部署 (包含本地 PostgreSQL 和 Nginx)"
read -p "请输入选项 (1 或 2): " choice

case $choice in
    1)
        echo "使用简单部署模式..."
        docker-compose -f docker-compose.simple.yml down 2>/dev/null || true
        docker-compose -f docker-compose.simple.yml up -d --build
        echo ""
        echo "部署完成！"
        echo "访问: http://localhost:3000"
        ;;
    2)
        echo "使用完整部署模式..."
        
        # 创建 SSL 证书目录
        mkdir -p certbot/conf certbot/www
        
        docker-compose down 2>/dev/null || true
        docker-compose up -d --build
        
        echo ""
        echo "部署完成！"
        echo "HTTP: http://localhost"
        echo "HTTPS: https://nodeapis.xyz (需要配置 SSL 证书)"
        echo ""
        echo "获取 SSL 证书 (首次需要):"
        echo "  docker-compose run --rm certbot certonly --webroot -w /var/www/certbot -d nodeapis.xyz -d www.nodeapis.xyz"
        ;;
    *)
        echo "无效选项"
        exit 1
        ;;
esac

echo ""
echo "=============================="
echo "常用命令："
echo "  查看日志: docker-compose logs -f app"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo "=============================="
