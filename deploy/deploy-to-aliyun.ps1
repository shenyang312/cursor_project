# SABER咨询网站 - 阿里云服务器部署脚本 (PowerShell版本)
# 使用方法: .\deploy-to-aliyun.ps1

Write-Host "🚀 SABER咨询网站 - 阿里云服务器部署脚本" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# 检查是否在项目根目录
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 错误：请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 创建部署包
Write-Host "📦 创建部署包..." -ForegroundColor Yellow

# 创建临时部署目录
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$deployDir = "saber-deploy-$timestamp"
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null

# 复制必要文件
Write-Host "📋 复制项目文件..." -ForegroundColor Yellow
Copy-Item "index.html", "admin.html", "test-email.html" -Destination $deployDir
Copy-Item "models" -Destination $deployDir -Recurse
Copy-Item "middleware" -Destination $deployDir -Recurse
Copy-Item "scripts" -Destination $deployDir -Recurse
Copy-Item "deploy" -Destination $deployDir -Recurse
Copy-Item "package.json", "package-lock.json" -Destination $deployDir
Copy-Item "server.js", "start.js", "config.js" -Destination $deployDir
Copy-Item "*.js" -Destination $deployDir -ErrorAction SilentlyContinue
Copy-Item "*.md" -Destination $deployDir -ErrorAction SilentlyContinue

# 创建生产环境配置文件
Write-Host "⚙️ 创建生产环境配置..." -ForegroundColor Yellow
$envContent = @"
# SABER咨询网站生产环境配置
NODE_ENV=production
PORT=3000

# 数据库配置（请根据实际情况修改）
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-database-password
DB_NAME=saber_consulting
DB_PORT=3306

# 邮箱配置（请根据实际情况修改）
QQ_EMAIL_PASS=your-qq-email-auth-code
HUAWEI_EMAIL_USER=your-email@your-domain.com
HUAWEI_EMAIL_PASS=your-huawei-email-auth-code

# 管理后台配置
ADMIN_USERNAME=Sy321098
ADMIN_PASSWORD=Sy098321

# 安全配置
JWT_SECRET=your-production-jwt-secret-key
SESSION_SECRET=your-production-session-secret-key

# 邮件通知配置
EMAIL_NOTIFICATIONS=true
RECEIVE_EMAIL=shen.5109256@qq.com
"@

$envContent | Out-File -FilePath "$deployDir\env.production" -Encoding UTF8

# 创建部署说明
$readmeContent = @"
# SABER咨询网站 - 阿里云服务器部署说明

## 🚀 快速部署

### 1. 上传文件到服务器
```bash
# 使用scp上传
scp -r $deployDir root@your-server-ip:/opt/saber-consulting

# 或使用其他工具上传到 /opt/saber-consulting 目录
```

### 2. 连接到服务器
```bash
ssh root@your-server-ip
```

### 3. 安装依赖
```bash
cd /opt/saber-consulting
npm install --production
```

### 4. 配置环境变量
```bash
# 复制并编辑环境配置文件
cp env.production .env
nano .env
```

### 5. 初始化数据库
```bash
# 运行数据库初始化脚本
node scripts/init-database.js
```

### 6. 启动服务
```bash
# 直接启动
npm start

# 或使用PM2（推荐）
npm install -g pm2
pm2 start start.js --name "saber-consulting"
pm2 save
pm2 startup
```

## 🔧 配置说明

### 数据库配置
- 确保MySQL服务已安装并运行
- 创建数据库：`CREATE DATABASE saber_consulting;`
- 修改.env文件中的数据库连接信息

### 邮箱配置
- 配置QQ邮箱或华为邮箱的SMTP授权码
- 确保防火墙允许SMTP端口（465/587）

### 安全配置
- 修改JWT_SECRET和SESSION_SECRET为强密码
- 修改管理后台用户名和密码

## 🌐 访问地址
- 网站首页：http://your-server-ip:3000
- 管理后台：http://your-server-ip:3000/admin
- 邮件测试：http://your-server-ip:3000/test

## 📝 注意事项
1. 确保服务器防火墙开放3000端口
2. 建议使用Nginx反向代理
3. 配置SSL证书以支持HTTPS
4. 定期备份数据库

## 🛠️ 维护命令
```bash
# 查看服务状态
pm2 status

# 重启服务
pm2 restart saber-consulting

# 查看日志
pm2 logs saber-consulting

# 停止服务
pm2 stop saber-consulting
```
"@

$readmeContent | Out-File -FilePath "$deployDir\DEPLOY_README.md" -Encoding UTF8

# 创建PM2配置文件
$pm2Config = @"
module.exports = {
  apps: [{
    name: 'saber-consulting',
    script: 'start.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
"@

$pm2Config | Out-File -FilePath "$deployDir\ecosystem.config.js" -Encoding UTF8

# 创建Nginx配置模板
$nginxConfig = @"
server {
    listen 80;
    server_name your-domain.com;  # 替换为您的域名

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
"@

$nginxConfig | Out-File -FilePath "$deployDir\nginx.conf" -Encoding UTF8

# 创建启动脚本
$startScript = @"
#!/bin/bash
echo "🚀 启动SABER咨询网站..."

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️ 警告：未找到.env文件，请先配置环境变量"
    echo "请复制 env.production 为 .env 并编辑配置"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install --production
fi

# 启动服务
echo "🌐 启动服务..."
npm start
"@

$startScript | Out-File -FilePath "$deployDir\start.sh" -Encoding UTF8

# 创建压缩包
Write-Host "📦 创建部署压缩包..." -ForegroundColor Yellow
$zipPath = "$deployDir.zip"
Compress-Archive -Path $deployDir -DestinationPath $zipPath -Force

# 清理临时目录
Remove-Item $deployDir -Recurse -Force

Write-Host "✅ 部署包创建完成！" -ForegroundColor Green
Write-Host "📦 部署包：$zipPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 下一步操作：" -ForegroundColor Yellow
Write-Host "1. 将 $zipPath 上传到阿里云服务器" -ForegroundColor White
Write-Host "2. 在服务器上解压：unzip $zipPath" -ForegroundColor White
Write-Host "3. 按照 DEPLOY_README.md 中的说明进行部署" -ForegroundColor White
Write-Host ""
Write-Host "🌐 推荐使用Git部署方式，更便于维护和更新" -ForegroundColor Cyan
