#!/bin/bash

# SABER咨询网站 - CentOS 7兼容安装脚本
# 适用于：CentOS 7服务器
# 使用方法: sudo bash install_centos7.sh

set -e

echo "🚀 SABER咨询网站 - CentOS 7兼容安装脚本"
echo "=========================================="

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用root用户运行此脚本"
    echo "使用: sudo bash install_centos7.sh"
    exit 1
fi

# 检查CentOS版本
if [ -f /etc/centos-release ]; then
    CENTOS_VERSION=$(cat /etc/centos-release | grep -oE '[0-9]+\.[0-9]+' | head -1)
    echo "📋 检测到CentOS版本: $CENTOS_VERSION"
else
    echo "⚠️ 未检测到CentOS系统，继续安装..."
fi

# 项目配置
PROJECT_NAME="saber-consulting"
PROJECT_DIR="/opt/$PROJECT_NAME"
GITHUB_REPO="https://github.com/shenyang312/cursor_project.git"

echo "📋 项目信息："
echo "   项目名称: $PROJECT_NAME"
echo "   安装目录: $PROJECT_DIR"
echo "   GitHub仓库: $GITHUB_REPO"
echo ""

# 更新系统
echo "🔄 更新系统包..."
yum update -y

# 安装基础工具
echo "📦 安装基础工具..."
yum install -y curl wget git unzip

# 安装EPEL仓库
echo "📦 安装EPEL仓库..."
yum install -y epel-release

# 安装Node.js (CentOS 7兼容版本)
echo "📦 安装Node.js..."
if ! command -v node &> /dev/null; then
    # 使用EPEL仓库安装Node.js 14.x (CentOS 7兼容)
    yum install -y nodejs npm
    echo "✅ Node.js安装完成: $(node --version)"
else
    echo "✅ Node.js已安装: $(node --version)"
fi

# 如果Node.js版本太低，使用nvm安装新版本
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 14 ]; then
        echo "📦 Node.js版本过低，使用nvm安装新版本..."
        
        # 安装nvm
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
        
        # 安装Node.js 14.x
        nvm install 14
        nvm use 14
        nvm alias default 14
        
        echo "✅ Node.js 14.x安装完成: $(node --version)"
    fi
fi

# 安装MySQL
echo "🗄️ 安装MySQL..."
if ! command -v mysql &> /dev/null; then
    yum install -y mariadb-server mariadb
    systemctl start mariadb
    systemctl enable mariadb
    
    echo "✅ MySQL安装完成"
    echo "⚠️ 请运行以下命令设置MySQL密码："
    echo "   mysql_secure_installation"
else
    echo "✅ MySQL已安装"
fi

# 安装Nginx
echo "🌐 安装Nginx..."
if ! command -v nginx &> /dev/null; then
    yum install -y nginx
    systemctl start nginx
    systemctl enable nginx
    echo "✅ Nginx安装完成"
else
    echo "✅ Nginx已安装"
fi

# 安装PM2
echo "⚡ 安装PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo "✅ PM2安装完成"
else
    echo "✅ PM2已安装"
fi

# 创建项目目录
echo "📁 创建项目目录..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# 克隆项目
echo "📥 克隆项目代码..."
if [ -d ".git" ]; then
    echo "🔄 更新现有代码..."
    git pull origin main
else
    echo "📥 克隆新代码..."
    git clone $GITHUB_REPO .
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install --production

# 创建环境配置文件
echo "⚙️ 配置环境变量..."
if [ ! -f ".env" ]; then
    cp env.example .env
    echo "✅ 环境配置文件已创建: $PROJECT_DIR/.env"
    echo "⚠️ 请编辑 .env 文件配置数据库和邮箱信息"
else
    echo "✅ 环境配置文件已存在"
fi

# 配置MySQL
echo "🗄️ 配置MySQL数据库..."
mysql -e "CREATE DATABASE IF NOT EXISTS saber_consulting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
    echo "⚠️ 无法自动创建数据库，请手动创建："
    echo "   mysql -u root -p"
    echo "   CREATE DATABASE saber_consulting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
}

# 初始化数据库
echo "📊 初始化数据库..."
if [ -f "scripts/init-database.js" ]; then
    node scripts/init-database.js
    echo "✅ 数据库初始化完成"
else
    echo "⚠️ 数据库初始化脚本未找到"
fi

# 配置Nginx
echo "🌐 配置Nginx..."
cat > /etc/nginx/conf.d/saber-consulting.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

# 重启Nginx
nginx -t && systemctl restart nginx
echo "✅ Nginx配置完成"

# 配置防火墙
echo "🔥 配置防火墙..."
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload
echo "✅ 防火墙配置完成"

# 启动应用
echo "🚀 启动应用..."
pm2 delete $PROJECT_NAME 2>/dev/null || true
pm2 start start.js --name $PROJECT_NAME
pm2 save
pm2 startup

echo ""
echo "🎉 安装完成！"
echo "=================================="
echo "📋 项目信息："
echo "   项目目录: $PROJECT_DIR"
echo "   配置文件: $PROJECT_DIR/.env"
echo ""
echo "🌐 访问地址："
echo "   网站首页: http://$(hostname -I | awk '{print $1}'):80"
echo "   管理后台: http://$(hostname -I | awk '{print $1}'):80/admin"
echo "   邮件测试: http://$(hostname -I | awk '{print $1}'):80/test"
echo ""
echo "🛠️ 管理命令："
echo "   查看状态: pm2 status"
echo "   查看日志: pm2 logs $PROJECT_NAME"
echo "   重启服务: pm2 restart $PROJECT_NAME"
echo "   停止服务: pm2 stop $PROJECT_NAME"
echo ""
echo "⚠️ 重要提醒："
echo "1. 请编辑 $PROJECT_DIR/.env 文件配置数据库和邮箱信息"
echo "2. 确保MySQL服务正在运行"
echo "3. 建议配置SSL证书以支持HTTPS"
echo "4. 定期备份数据库"
echo ""
echo "📞 如需帮助，请查看项目文档或联系技术支持"
