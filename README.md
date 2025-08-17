# SABER专业咨询网站

一个专业的沙特SABER认证咨询网站，提供双语支持（中文/英文）和完整的咨询管理系统。

## 🌟 功能特性

### 前端功能
- ✅ **双语支持** - 完整的中文/英文双语界面
- ✅ **响应式设计** - 适配各种设备屏幕
- ✅ **咨询表单** - 专业的咨询提交系统
- ✅ **浮动聊天** - 实时在线咨询窗口
- ✅ **文章系统** - 专业文章展示和管理
- ✅ **搜索功能** - 文章搜索和分类筛选

### 后端功能
- ✅ **Express服务器** - 高性能Node.js后端
- ✅ **MySQL数据库** - 完整的数据存储方案
- ✅ **邮件系统** - 自动邮件通知功能
- ✅ **管理后台** - 完整的后台管理系统
- ✅ **API接口** - RESTful API设计
- ✅ **安全防护** - 速率限制和安全中间件

### 技术栈
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js, Express.js
- **数据库**: MySQL 8.0+
- **邮件**: Nodemailer
- **安全**: Helmet, CORS, Rate Limiting

## 🚀 快速开始

### 环境要求
- Node.js 14.0.0 或更高版本
- MySQL 8.0 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd saber-consulting-website
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp env.example .env

# 编辑 .env 文件，配置数据库和邮箱信息
```

4. **配置数据库**
```bash
# 方法1: 使用提供的脚本
npm run db:init

# 方法2: 手动执行SQL文件
mysql -u root -p < deploy/mysql-setup.sql
```

5. **启动项目**
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

6. **访问网站**
- 网站首页: http://localhost:3000
- 管理后台: http://localhost:3000/admin
- 邮件测试: http://localhost:3000/test
- 健康检查: http://localhost:3000/api/health

## ⚙️ 配置说明

### 环境变量配置 (.env)

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=saber_consulting
DB_PORT=3306

# 邮箱配置
QQ_EMAIL_PASS=your-qq-email-auth-code
HUAWEI_EMAIL_USER=your-email@your-domain.com
HUAWEI_EMAIL_PASS=your-huawei-email-auth-code

# 管理后台配置
ADMIN_USERNAME=Sy321098
ADMIN_PASSWORD=Sy098321
```

### 邮箱配置

#### QQ邮箱设置
1. 登录QQ邮箱
2. 进入设置 → 账户
3. 开启SMTP服务
4. 获取授权码并配置到 `.env` 文件

#### 华为企业邮箱设置
1. 登录华为企业邮箱
2. 进入设置 → 客户端设置
3. 开启SMTP服务
4. 获取授权码并配置到 `.env` 文件

## 📁 项目结构

```
saber-consulting-website/
├── config.js                 # 配置文件
├── server.js                 # 服务器入口文件
├── package.json              # 项目依赖
├── env.example               # 环境变量模板
├── README.md                 # 项目说明
├── index.html                # 网站首页
├── admin.html                # 管理后台
├── test-email.html           # 邮件测试页面
├── deploy/                   # 部署相关文件
│   ├── install.sh           # 安装脚本
│   └── mysql-setup.sql      # 数据库初始化脚本
├── middleware/               # 中间件
│   └── rateLimit.js         # 速率限制中间件
├── models/                   # 数据模型
│   ├── database.js          # 数据库连接
│   └── article.js           # 文章模型
└── scripts/                  # 脚本文件
    └── setup.js             # 项目设置脚本
```

## 🔧 管理后台

### 登录信息
- 用户名: `Sy321098`
- 密码: `Sy098321`

### 功能特性
- 📝 文章管理（增删改查）
- 📊 数据统计
- 📧 咨询记录查看
- ⚙️ 系统设置

## 📧 API接口

### 文章相关
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取文章详情
- `POST /api/admin/articles` - 创建文章
- `PUT /api/admin/articles/:id` - 更新文章
- `DELETE /api/admin/articles/:id` - 删除文章

### 咨询相关
- `POST /api/inquiry` - 提交咨询表单
- `POST /api/chat` - 提交聊天消息
- `GET /api/inquiries` - 获取咨询记录

### 系统相关
- `GET /api/health` - 健康检查
- `POST /api/admin/login` - 管理员登录

## 🛠️ 开发命令

```bash
# 开发模式
npm run dev

# 生产模式
npm start

# 项目设置
npm run setup

# 数据库初始化
npm run db:init

# 数据库重置
npm run db:reset

# 代码检查
npm run lint

# 运行测试
npm test
```

## 🔒 安全特性

- **Helmet** - 安全头设置
- **CORS** - 跨域资源共享控制
- **Rate Limiting** - 请求速率限制
- **输入验证** - 数据验证和清理
- **SQL注入防护** - 参数化查询

## 📊 数据库设计

### 主要表结构
- `articles` - 文章表
- `inquiries` - 咨询记录表
- `chat_messages` - 聊天消息表
- `article_stats` - 文章统计表
- `system_settings` - 系统设置表

## 🚀 部署指南

### 本地部署
1. 按照上述安装步骤操作
2. 确保MySQL服务运行
3. 配置正确的环境变量
4. 启动服务器

### 服务器部署
1. 上传代码到服务器
2. 安装Node.js和MySQL
3. 配置环境变量
4. 使用PM2或类似工具管理进程

```bash
# 使用PM2部署
npm install -g pm2
pm2 start server.js --name saber-website
pm2 startup
pm2 save
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 邮箱: shen.5109256@qq.com
- 网站: http://localhost:3000
- 管理后台: http://localhost:3000/admin

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**SABER专业咨询** - 沙特市场准入专家
