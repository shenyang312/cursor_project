# GitHub发布指南

## 🎯 目标

将SABER咨询网站代码发布到GitHub，并提供在Linux服务器上的快速部署方案。

## 📋 发布步骤

### 1. 准备代码

项目已经配置好以下文件：
- ✅ `.gitignore` - 排除不必要的文件
- ✅ `env.example` - 环境变量模板
- ✅ `deploy/install.sh` - Linux完整安装脚本
- ✅ `deploy/quick-deploy.sh` - Linux快速部署脚本
- ✅ `deploy/mysql-setup.sql` - 数据库初始化脚本

### 2. 发布到GitHub

```bash
# 初始化Git仓库
git init

# 添加文件到暂存区
git add .

# 提交代码
git commit -m "Initial commit: SABER专业咨询网站"

# 添加远程仓库（替换为您的GitHub仓库地址）
git remote add origin https://github.com/your-username/saber-consulting-website.git

# 推送到GitHub
git push -u origin main
```

### 3. 在Linux服务器上部署

#### 方法1: 使用完整安装脚本（推荐新服务器）

```bash
# 克隆项目
git clone https://github.com/your-username/saber-consulting-website.git
cd saber-consulting-website

# 给脚本执行权限
chmod +x deploy/install.sh

# 运行安装脚本
./deploy/install.sh
```

#### 方法2: 使用快速部署脚本（已有Node.js和MySQL）

```bash
# 克隆项目
git clone https://github.com/your-username/saber-consulting-website.git
cd saber-consulting-website

# 给脚本执行权限
chmod +x deploy/quick-deploy.sh

# 运行快速部署脚本
./deploy/quick-deploy.sh
```

#### 方法3: 手动部署

```bash
# 1. 克隆项目
git clone https://github.com/your-username/saber-consulting-website.git
cd saber-consulting-website

# 2. 安装依赖
npm install --production

# 3. 配置环境变量
cp env.example .env
# 编辑.env文件配置邮箱授权码

# 4. 配置数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS saber_consulting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'saber_user'@'localhost' IDENTIFIED BY 'saber_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON saber_consulting.* TO 'saber_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

# 5. 初始化数据库
mysql -u saber_user -psaber_password saber_consulting < deploy/mysql-setup.sql

# 6. 安装PM2
sudo npm install -g pm2

# 7. 启动服务
pm2 start server.js --name saber-consulting
pm2 startup
pm2 save
```

## 📁 项目文件说明

### 核心文件
- `index.html` - 网站首页（双语支持）
- `admin.html` - 管理后台
- `server.js` - Express服务器
- `config.js` - 配置文件
- `package.json` - 项目依赖

### 部署文件
- `deploy/install.sh` - 完整安装脚本（安装Node.js、MySQL、PM2等）
- `deploy/quick-deploy.sh` - 快速部署脚本（已有环境）
- `deploy/mysql-setup.sql` - 数据库初始化脚本

### 配置文件
- `.gitignore` - Git忽略文件（排除node_modules、.env等）
- `env.example` - 环境变量模板
- `middleware/` - 中间件（速率限制等）
- `models/` - 数据模型

### 文档文件
- `README.md` - 项目详细说明
- `项目总结.md` - 项目功能总结
- `GitHub部署说明.md` - 详细部署说明
- `GitHub发布指南.md` - 本文档

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

### PM2管理命令

```bash
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

### systemd管理命令（如果使用完整安装脚本）

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
```

## 🌐 访问地址

部署完成后，可以访问：

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

## 📊 项目特色

### 技术优势
- ✅ **现代化架构** - Node.js + Express + MySQL
- ✅ **安全可靠** - 多重安全防护措施
- ✅ **性能优化** - 支持压缩和缓存
- ✅ **易于维护** - 清晰的代码结构

### 功能特色
- ✅ **双语支持** - 完整的中英文界面
- ✅ **响应式设计** - 适配各种设备
- ✅ **专业咨询** - 完整的咨询流程
- ✅ **管理后台** - 完整的后台管理

### 部署优势
- ✅ **一键部署** - 自动化安装脚本
- ✅ **环境隔离** - 独立的数据库用户
- ✅ **进程管理** - PM2进程管理
- ✅ **系统服务** - systemd服务集成

## 🆘 故障排除

### 常见问题

1. **端口被占用**：
   ```bash
   sudo netstat -tlnp | grep :3000
   sudo kill -9 <PID>
   ```

2. **数据库连接失败**：
   ```bash
   sudo systemctl status mysql
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

**您的SABER咨询网站已经准备就绪！** 🎉

现在可以开始配置和部署，让这个专业的双语网站为您的业务服务。
