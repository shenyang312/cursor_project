#!/bin/bash

echo "🚀 SABER咨询网站 - 快速部署脚本"
echo "=================================="

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装Node.js"
    exit 1
fi

# 检查MySQL
if ! command -v mysql &> /dev/null; then
    echo "❌ 请先安装MySQL"
    exit 1
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install --production

# 创建环境变量文件
if [ ! -f ".env" ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
    echo "⚠️  请编辑.env文件配置邮箱授权码"
fi

# 检查数据库连接
echo "🗄️ 检查数据库连接..."
if mysql -u root -p -e "USE saber_consulting;" 2>/dev/null; then
    echo "✅ 数据库已存在"
else
    echo "📊 创建数据库..."
    mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS saber_consulting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    mysql -u root -p -e "CREATE USER IF NOT EXISTS 'saber_user'@'localhost' IDENTIFIED BY 'saber_password';"
    mysql -u root -p -e "GRANT ALL PRIVILEGES ON saber_consulting.* TO 'saber_user'@'localhost';"
    mysql -u root -p -e "FLUSH PRIVILEGES;"
    
    echo "🗄️ 初始化数据库..."
    mysql -u saber_user -psaber_password saber_consulting < deploy/mysql-setup.sql
fi

# 安装PM2
if ! command -v pm2 &> /dev/null; then
    echo "⚡ 安装PM2..."
    sudo npm install -g pm2
fi

# 启动服务
echo "🚀 启动服务..."
pm2 start server.js --name saber-consulting
pm2 startup
pm2 save

echo "🎉 部署完成！"
echo ""
echo "📋 访问地址："
echo "   http://localhost:3000"
echo ""
echo "🔧 管理命令："
echo "   pm2 status          # 查看状态"
echo "   pm2 logs saber-consulting  # 查看日志"
echo "   pm2 restart saber-consulting  # 重启服务"
