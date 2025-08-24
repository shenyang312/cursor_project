# SABER咨询网站 - Linux服务器部署说明

## 🚀 一键部署方案

您的项目已成功推送到GitHub：`https://github.com/shenyang312/cursor_project.git`

### 方案一：完整部署（推荐）

**适用于：全新服务器或需要安装所有依赖**

```bash
# 1. 下载部署脚本
wget https://raw.githubusercontent.com/shenyang312/cursor_project/main/deploy/linux-deploy.sh

# 2. 给脚本执行权限
chmod +x linux-deploy.sh

# 3. 运行部署脚本（需要root权限）
sudo ./linux-deploy.sh
```

### 方案二：快速部署

**适用于：已安装Node.js、MySQL、PM2的服务器**

```bash
# 1. 下载快速部署脚本
wget https://raw.githubusercontent.com/shenyang312/cursor_project/main/deploy/quick-deploy.sh

# 2. 给脚本执行权限
chmod +x quick-deploy.sh

# 3. 运行快速部署
./quick-deploy.sh
```

### 方案三：手动部署

**适用于：需要自定义配置的情况**

```bash
# 1. 创建项目目录
sudo mkdir -p /opt/saber-consulting
cd /opt/saber-consulting

# 2. 克隆项目
git clone https://github.com/shenyang312/cursor_project.git .

# 3. 安装依赖
npm install --production

# 4. 配置环境变量
cp env.example .env
nano .env

# 5. 初始化数据库
node scripts/init-database.js

# 6. 安装PM2并启动
npm install -g pm2
pm2 start start.js --name saber-consulting
pm2 save
pm2 startup
```

---

## 🔧 环境配置

### 1. 编辑环境配置文件

部署完成后，需要编辑 `/opt/saber-consulting/.env` 文件：

```bash
nano /opt/saber-consulting/.env
```

**重要配置项：**

```env
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=saber_consulting
DB_PORT=3306

# 邮箱配置（QQ邮箱）
QQ_EMAIL_PASS=your-qq-email-auth-code

# 管理后台配置
ADMIN_USERNAME=Sy321098
ADMIN_PASSWORD=Sy098321

# 安全配置
JWT_SECRET=your-production-jwt-secret-key
SESSION_SECRET=your-production-session-secret-key
```

### 2. 配置MySQL

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE saber_consulting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户（可选）
CREATE USER 'saber_user'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON saber_consulting.* TO 'saber_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. 配置防火墙

```bash
# 开放端口
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

---

## 🌐 访问地址

部署完成后，可以通过以下地址访问：

- **网站首页**: http://your-server-ip:80
- **管理后台**: http://your-server-ip:80/admin
- **邮件测试**: http://your-server-ip:80/test

**管理后台登录信息：**
- 用户名：`Sy321098`
- 密码：`Sy098321`

---

## 🛠️ 管理命令

### PM2管理
```bash
# 查看服务状态
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

### 服务管理
```bash
# 重启Nginx
sudo systemctl restart nginx

# 重启MySQL
sudo systemctl restart mysqld

# 查看服务状态
sudo systemctl status nginx
sudo systemctl status mysqld
```

### 数据库管理
```bash
# 备份数据库
mysqldump -u root -p saber_consulting > backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -u root -p saber_consulting < backup_20231201.sql
```

---

## 📝 更新部署

### 自动更新
```bash
cd /opt/saber-consulting
git pull origin main
npm install --production
pm2 restart saber-consulting
```

### 手动更新
```bash
# 1. 备份当前版本
cp -r /opt/saber-consulting /opt/saber-consulting-backup

# 2. 拉取最新代码
cd /opt/saber-consulting
git pull origin main

# 3. 安装依赖
npm install --production

# 4. 重启服务
pm2 restart saber-consulting
```

---

## 🆘 常见问题

### Q: 端口被占用怎么办？
A: 修改 `.env` 文件中的 `PORT` 配置，或使用 `netstat -tulpn | grep :3000` 查看占用进程

### Q: 数据库连接失败？
A: 检查MySQL服务状态、用户名密码、数据库名称是否正确

### Q: 邮件发送失败？
A: 检查邮箱授权码配置、防火墙设置、SMTP端口是否开放

### Q: 服务无法启动？
A: 查看PM2日志：`pm2 logs saber-consulting`

### Q: 网站无法访问？
A: 检查防火墙设置、Nginx配置、服务状态

---

## 📞 技术支持

如遇到问题，请检查：
1. 服务器日志
2. 应用日志
3. 网络连接
4. 配置文件

**项目GitHub地址：** https://github.com/shenyang312/cursor_project

**部署脚本位置：**
- 完整部署：`deploy/linux-deploy.sh`
- 快速部署：`deploy/quick-deploy.sh`

---

## 🎯 推荐部署流程

1. **选择部署方案**：根据服务器环境选择合适的部署脚本
2. **运行部署脚本**：执行自动化部署
3. **配置环境变量**：编辑 `.env` 文件配置数据库和邮箱
4. **测试访问**：确认网站和管理后台可以正常访问
5. **配置域名**：如有域名，配置DNS解析和SSL证书
6. **定期维护**：定期更新代码、备份数据库、监控服务状态
