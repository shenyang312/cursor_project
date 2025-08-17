#!/bin/bash

echo "🚀 SABER咨询网站 - Linux部署脚本"
echo "=================================="

# 安装Node.js
if ! command -v node &> /dev/null; then
    echo "📦 安装Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 安装MySQL
if ! command -v mysql &> /dev/null; then
    echo "🗄️ 安装MySQL..."
    sudo apt-get update
    sudo apt-get install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
fi

# 安装PM2
if ! command -v pm2 &> /dev/null; then
    echo "⚡ 安装PM2..."
    sudo npm install -g pm2
fi

# 配置MySQL
echo "🔧 配置MySQL..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS saber_consulting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'saber_user'@'localhost' IDENTIFIED BY 'saber_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON saber_consulting.* TO 'saber_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 安装项目依赖
echo "📦 安装项目依赖..."
npm install --production

# 创建环境变量文件
if [ ! -f ".env" ]; then
    echo "📝 创建环境变量文件..."
    cat > .env << EOF
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_USER=saber_user
DB_PASSWORD=saber_password
DB_NAME=saber_consulting
DB_PORT=3306
QQ_EMAIL_PASS=your-qq-email-auth-code
ADMIN_USERNAME=Sy321098
ADMIN_PASSWORD=Sy098321
EMAIL_NOTIFICATIONS=true
RECEIVE_EMAIL=shen.5109256@qq.com
EOF
fi

# 初始化数据库
echo "🗄️ 初始化数据库..."
mysql -u saber_user -psaber_password saber_consulting < deploy/mysql-setup.sql

# 创建PM2配置
echo "⚙️ 创建PM2配置..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'saber-consulting',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production', PORT: 3000 },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    time: true,
    max_memory_restart: '1G'
  }]
};
EOF

mkdir -p logs

# 创建systemd服务
echo "🔧 创建系统服务..."
sudo tee /etc/systemd/system/saber-consulting.service > /dev/null << EOF
[Unit]
Description=SABER Consulting Website
After=network.target mysql.service

[Service]
Type=forking
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload saber-consulting
ExecStop=/usr/bin/pm2 stop saber-consulting
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable saber-consulting.service

# 配置防火墙
echo "🔥 配置防火墙..."
sudo ufw allow 3000/tcp 2>/dev/null || sudo firewall-cmd --permanent --add-port=3000/tcp 2>/dev/null

echo "🎉 部署完成！"
echo ""
echo "📋 下一步操作："
echo "1. 编辑 .env 文件配置邮箱授权码"
echo "2. 启动服务: sudo systemctl start saber-consulting"
echo "3. 访问: http://localhost:3000"
