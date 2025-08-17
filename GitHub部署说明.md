# GitHub部署说明

## 🚀 将代码发布到GitHub

### 1. 初始化Git仓库

```bash
# 初始化Git仓库
git init

# 添加所有文件到暂存区
git add .

# 提交初始代码
git commit -m "Initial commit: SABER咨询网站"

# 添加远程仓库（替换为您的GitHub仓库地址）
git remote add origin https://github.com/your-username/saber-consulting-website.git

# 推送到GitHub
git push -u origin main
```

### 2. 在Linux服务器上部署

```bash
# 克隆项目
git clone https://github.com/your-username/saber-consulting-website.git
cd saber-consulting-website

# 给安装脚本执行权限
chmod +x deploy/install.sh

# 运行安装脚本
./deploy/install.sh
```

### 3. 手动部署步骤（如果脚本失败）

```bash
# 1. 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 安装MySQL
sudo apt-get update
sudo apt-get install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# 3. 安装PM2
sudo npm install -g pm2

# 4. 配置MySQL
sudo mysql -e "CREATE DATABASE IF NOT EXISTS saber_consulting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'saber_user'@'localhost' IDENTIFIED BY 'saber_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON saber_consulting.* TO 'saber_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 5. 安装项目依赖
npm install --production

# 6. 创建环境变量文件
cp env.example .env
# 编辑.env文件配置邮箱等信息

# 7. 初始化数据库
mysql -u saber_user -psaber_password saber_consulting < deploy/mysql-setup.sql

# 8. 启动服务
pm2 start server.js --name saber-consulting
pm2 startup
pm2 save
```

## 📁 项目文件结构

```
saber-consulting-website/
├── 📄 主要文件
│   ├── index.html              # 网站首页
│   ├── admin.html              # 管理后台
│   ├── server.js               # 服务器入口
│   ├── config.js               # 配置文件
│   └── package.json            # 项目依赖
├── 🗄️ 数据库
│   └── deploy/mysql-setup.sql  # 数据库初始化脚本
├── 🔧 部署文件
│   └── deploy/install.sh       # Linux安装脚本
├── 📚 文档
│   ├── README.md               # 项目说明
│   ├── 项目总结.md             # 项目总结
│   └── GitHub部署说明.md       # 本文档
├── 🔒 配置文件
│   ├── .gitignore              # Git忽略文件
│   └── env.example             # 环境变量模板
└── 📦 核心功能
    ├── middleware/             # 中间件
    ├── models/                # 数据模型
    └── scripts/               # 工具脚本
```

## ⚙️ 配置说明

### 环境变量配置

复制 `env.example` 为 `.env` 并配置：

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
DB_HOST=localhost
DB_USER=saber_user
DB_PASSWORD=saber_password
DB_NAME=saber_consulting
DB_PORT=3306

# 邮箱配置（重要！）
QQ_EMAIL_PASS=your-qq-email-auth-code

# 管理后台
ADMIN_USERNAME=Sy321098
ADMIN_PASSWORD=Sy098321

# 邮件通知
EMAIL_NOTIFICATIONS=true
RECEIVE_EMAIL=shen.5109256@qq.com
```

### 邮箱配置

1. **QQ邮箱设置**：
   - 登录QQ邮箱
   - 设置 → 账户 → 开启SMTP服务
   - 获取授权码并配置到 `.env` 文件

2. **华为企业邮箱设置**：
   - 登录华为企业邮箱
   - 设置 → 客户端设置 → 开启SMTP服务
   - 获取授权码并配置到 `.env` 文件

## 🔧 服务管理

### 使用PM2管理

```bash
# 启动服务
pm2 start server.js --name saber-consulting

# 查看状态
pm2 status

# 查看日志
pm2 logs saber-consulting

# 重启服务
pm2 restart saber-consulting

# 停止服务
pm2 stop saber-consulting

# 删除服务
pm2 delete saber-consulting
```

### 使用systemd管理

```bash
# 启动服务
sudo systemctl start saber-consulting

# 停止服务
sudo systemctl stop saber-consulting

# 重启服务
sudo systemctl restart saber-consulting

# 查看状态
sudo systemctl status saber-consulting

# 查看日志
sudo journalctl -u saber-consulting -f

# 设置开机自启
sudo systemctl enable saber-consulting
```

## 🌐 访问地址

- **网站首页**: http://your-server-ip:3000
- **管理后台**: http://your-server-ip:3000/admin
- **邮件测试**: http://your-server-ip:3000/test
- **健康检查**: http://your-server-ip:3000/api/health

## 🔒 安全建议

1. **修改默认密码**：
   - 修改管理后台默认密码
   - 修改数据库用户密码

2. **配置防火墙**：
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 3000/tcp
   sudo ufw enable
   
   # CentOS/RHEL
   sudo firewall-cmd --permanent --add-port=3000/tcp
   sudo firewall-cmd --reload
   ```

3. **配置SSL证书**（推荐）：
   ```bash
   # 安装Certbot
   sudo apt-get install certbot python3-certbot-nginx
   
   # 获取SSL证书
   sudo certbot --nginx -d your-domain.com
   ```

## 📊 监控和维护

### 查看系统状态

```bash
# 查看PM2进程
pm2 monit

# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 备份数据库

```bash
# 备份数据库
mysqldump -u saber_user -p saber_consulting > backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -u saber_user -p saber_consulting < backup_20240101.sql
```

## 🆘 故障排除

### 常见问题

1. **端口被占用**：
   ```bash
   # 查看端口占用
   sudo netstat -tlnp | grep :3000
   
   # 杀死进程
   sudo kill -9 <PID>
   ```

2. **数据库连接失败**：
   ```bash
   # 检查MySQL状态
   sudo systemctl status mysql
   
   # 重启MySQL
   sudo systemctl restart mysql
   ```

3. **邮件发送失败**：
   - 检查邮箱授权码是否正确
   - 检查网络连接
   - 查看服务器日志

### 查看日志

```bash
# 查看应用日志
pm2 logs saber-consulting

# 查看系统日志
sudo journalctl -u saber-consulting -f

# 查看MySQL日志
sudo tail -f /var/log/mysql/error.log
```

## 📞 技术支持

如果遇到问题，请：

1. 查看日志文件
2. 检查配置文件
3. 确认网络连接
4. 验证数据库状态

---

**祝您部署顺利！** 🎉
