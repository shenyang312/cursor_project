#!/bin/bash

# SABER咨询网站 - Git部署脚本
# 使用方法: ./git-deploy.sh

set -e

echo "🚀 SABER咨询网站 - Git部署脚本"
echo "================================"

# 检查Git是否安装
if ! command -v git &> /dev/null; then
    echo "❌ 错误：Git未安装，请先安装Git"
    exit 1
fi

# 检查是否在Git仓库中
if [ ! -d ".git" ]; then
    echo "❌ 错误：当前目录不是Git仓库"
    echo "请先初始化Git仓库："
    echo "git init"
    echo "git add ."
    echo "git commit -m 'Initial commit'"
    exit 1
fi

# 检查是否有远程仓库
if ! git remote -v | grep -q origin; then
    echo "⚠️ 警告：未配置远程仓库"
    echo "请先添加远程仓库："
    echo "git remote add origin <your-repository-url>"
    echo ""
    echo "支持的Git平台："
    echo "- GitHub: https://github.com/username/repo.git"
    echo "- GitLab: https://gitlab.com/username/repo.git"
    echo "- Gitee: https://gitee.com/username/repo.git"
    echo "- 阿里云Code: https://codeup.aliyun.com/username/repo.git"
    exit 1
fi

# 显示当前状态
echo "📋 当前Git状态："
git status --short

# 询问是否提交更改
read -p "是否提交当前更改？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 添加所有文件
    git add .
    
    # 提交更改
    read -p "请输入提交信息: " commit_message
    if [ -z "$commit_message" ]; then
        commit_message="Update $(date +%Y-%m-%d_%H:%M:%S)"
    fi
    
    git commit -m "$commit_message"
    echo "✅ 更改已提交"
fi

# 推送到远程仓库
echo "📤 推送到远程仓库..."
git push origin main

echo "✅ Git部署完成！"
echo ""
echo "📋 在阿里云服务器上的部署步骤："
echo ""
echo "1. 连接到服务器："
echo "   ssh root@your-server-ip"
echo ""
echo "2. 克隆项目："
echo "   git clone <your-repository-url> /opt/saber-consulting"
echo "   cd /opt/saber-consulting"
echo ""
echo "3. 安装依赖："
echo "   npm install --production"
echo ""
echo "4. 配置环境变量："
echo "   cp env.example .env"
echo "   nano .env"
echo ""
echo "5. 初始化数据库："
echo "   node scripts/init-database.js"
echo ""
echo "6. 启动服务："
echo "   npm install -g pm2"
echo "   pm2 start start.js --name 'saber-consulting'"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "🌐 访问地址：http://your-server-ip:3000"
