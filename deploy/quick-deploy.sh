#!/bin/bash

# SABER咨询网站 - 快速部署脚本
# 使用方法: ./quick-deploy.sh

echo "🚀 SABER咨询网站 - 快速部署"
echo "============================"

# 项目配置
PROJECT_DIR="/opt/saber-consulting"
GITHUB_REPO="https://github.com/shenyang312/cursor_project.git"

echo "📥 克隆项目..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

if [ -d ".git" ]; then
    echo "🔄 更新代码..."
    git pull origin main
else
    echo "📥 克隆代码..."
    git clone $GITHUB_REPO .
fi

echo "📦 安装依赖..."
npm install --production

echo "⚙️ 配置环境..."
if [ ! -f ".env" ]; then
    cp env.example .env
    echo "✅ 环境配置文件已创建，请编辑 $PROJECT_DIR/.env"
fi

echo "📊 初始化数据库..."
node scripts/init-database.js

echo "🚀 启动服务..."
pm2 delete saber-consulting 2>/dev/null || true
pm2 start start.js --name saber-consulting
pm2 save

echo "✅ 部署完成！"
echo "🌐 访问地址: http://$(hostname -I | awk '{print $1}'):3000"
echo "🔧 管理命令: pm2 status"
