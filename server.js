// 加载环境变量
require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config');
const rateLimit = require('./middleware/rateLimit');
const articleModel = require('./models/article');
const { testConnection } = require('./models/database');
const crypto = require('crypto');

const app = express();
const PORT = config.server.port;

// 安全中间件
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // 允许内联脚本
            scriptSrcAttr: ["'self'", "'unsafe-inline'"], // 新增允许内联事件处理
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// 压缩中间件
app.use(compression());

// CORS配置
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('.'));

// 邮件配置 - 根据配置选择邮箱
const emailConfig = config[config.email] || config.qqEmail;
let transporter;

try {
    transporter = nodemailer.createTransport(emailConfig);
    console.log('✅ 邮件服务配置成功');
} catch (error) {
    console.error('❌ 邮件服务配置失败:', error.message);
}

// 数据库连接测试
testConnection().then(success => {
    if (success) {
        console.log('✅ 数据库连接成功');
    } else {
        console.error('❌ 数据库连接失败');
    }
});

// 简易内容清洗（基础防XSS）
function sanitizeHtmlBasic(html) {
    if (!html || typeof html !== 'string') return html;
    let s = html;
    // 去除<script>标签
    s = s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    // 去除事件处理程序 on*
    s = s.replace(/\s+on[a-zA-Z]+\s*=\s*"[^"]*"/gi, '');
    s = s.replace(/\s+on[a-zA-Z]+\s*=\s*'[^']*'/gi, '');
    s = s.replace(/\s+on[a-zA-Z]+\s*=\s*[^\s>]+/gi, '');
    // 过滤 javascript: 协议
    s = s.replace(/(href|src)\s*=\s*"javascript:[^"]*"/gi, '$1="#"');
    s = s.replace(/(href|src)\s*=\s*'javascript:[^']*'/gi, '$1="#"');
    return s;
}

// 简易管理令牌
let adminToken = null;
function generateAdminToken() {
    adminToken = crypto.randomBytes(24).toString('hex');
    return adminToken;
}

function checkAdminAuth(req, res, next) {
    const token = req.headers['x-admin-token'];
    if (!token || token !== adminToken) {
        return res.status(401).json({ success: false, message: '未授权' });
    }
    next();
}

// 处理咨询表单提交
app.post('/api/inquiry', rateLimit.emailRateLimit(), async (req, res) => {
    try {
        const { name, email, message, subject, company, phone, service } = req.body;
        
        // 验证必填字段
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                message: '请填写姓名、邮箱和咨询内容' 
            });
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: '邮箱格式不正确' 
            });
        }
        
        // 邮件内容
        const mailOptions = {
            from: emailConfig.auth.user,
            to: config.receiveEmail,
            subject: `SABER咨询 - ${subject || '新咨询'}`,
            html: `
                <h2>新的SABER认证咨询</h2>
                <p><strong>姓名:</strong> ${name}</p>
                <p><strong>邮箱:</strong> ${email}</p>
                <p><strong>公司:</strong> ${company || '未提供'}</p>
                <p><strong>电话:</strong> ${phone || '未提供'}</p>
                <p><strong>服务类型:</strong> ${service || '未选择'}</p>
                <p><strong>咨询内容:</strong></p>
                <p>${message}</p>
                <hr>
                <p><small>发送时间: ${new Date().toLocaleString('zh-CN')}</small></p>
            `
        };

        // 发送邮件
        if (transporter) {
            await transporter.sendMail(mailOptions);
            
            // 发送确认邮件给客户
            const confirmMailOptions = {
                from: emailConfig.auth.user,
                to: email,
                subject: '感谢您的SABER认证咨询',
                html: `
                    <h2>感谢您的咨询！</h2>
                    <p>亲爱的 ${name}，</p>
                    <p>我们已收到您的SABER认证咨询请求，我们的专业团队将在24小时内与您联系。</p>
                    <p>您的咨询内容：</p>
                    <p>${message}</p>
                    <hr>
                    <p>如有任何问题，请随时联系我们。</p>
                    <p>祝好！</p>
                    <p>SABER专业咨询团队</p>
                `
            };

            await transporter.sendMail(confirmMailOptions);
        }
        
        res.json({ success: true, message: '咨询已提交，我们将尽快与您联系！' });
        
    } catch (error) {
        console.error('发送邮件失败:', error);
        res.status(500).json({ success: false, message: '发送失败，请稍后重试' });
    }
});

// 处理浮动聊天消息
app.post('/api/chat', rateLimit.emailRateLimit(), async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        // 验证必填字段
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                message: '请填写姓名、邮箱和消息内容' 
            });
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: '邮箱格式不正确' 
            });
        }
        
        // 邮件内容
        const mailOptions = {
            from: emailConfig.auth.user,
            to: config.receiveEmail,
            subject: 'SABER在线咨询 - 浮动聊天',
            html: `
                <h2>新的在线咨询消息</h2>
                <p><strong>姓名:</strong> ${name}</p>
                <p><strong>邮箱:</strong> ${email}</p>
                <p><strong>消息内容:</strong></p>
                <p>${message}</p>
                <hr>
                <p><small>发送时间: ${new Date().toLocaleString('zh-CN')}</small></p>
            `
        };

        // 发送邮件
        if (transporter) {
            await transporter.sendMail(mailOptions);
        }
        
        res.json({ success: true, message: '消息已发送！' });
        
    } catch (error) {
        console.error('发送邮件失败:', error);
        res.status(500).json({ success: false, message: '发送失败，请稍后重试' });
    }
});

// 获取所有咨询记录
app.get('/api/inquiries', rateLimit.apiRateLimit(), async (req, res) => {
    try {
        // 这里可以从数据库获取咨询记录
        res.json({ 
            success: true, 
            message: '咨询记录功能待实现',
            data: [] 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取咨询记录失败' });
    }
});

// 文章相关API
app.get('/api/articles', rateLimit.apiRateLimit(), async (req, res) => {
    try {
        const { category, search } = req.query;
        let articles;
        
        if (search) {
            articles = await articleModel.searchArticles(search);
        } else if (category) {
            articles = await articleModel.getArticlesByCategory(category);
        } else {
            articles = await articleModel.getAllArticles();
        }
        
        res.json({ success: true, data: articles });
    } catch (error) {
        console.error('获取文章失败:', error);
        res.status(500).json({ success: false, message: '获取文章失败' });
    }
});

app.get('/api/articles/:id', rateLimit.apiRateLimit(), async (req, res) => {
    try {
        const article = await articleModel.getArticleById(req.params.id);
        if (article) {
            // 增加浏览次数
            await articleModel.incrementViews(req.params.id);
            res.json({ success: true, data: article });
        } else {
            res.status(404).json({ success: false, message: '文章不存在' });
        }
    } catch (error) {
        console.error('获取文章详情失败:', error);
        res.status(500).json({ success: false, message: '获取文章失败' });
    }
});

// 管理后台登录
app.post('/api/admin/login', rateLimit.loginRateLimit(), (req, res) => {
    const { username, password } = req.body;
    
    if (username === config.admin.username && password === config.admin.password) {
        const token = generateAdminToken();
        res.json({ success: true, message: '登录成功', token });
    } else {
        res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
});

// 管理后台文章管理
app.post('/api/admin/articles', checkAdminAuth, rateLimit.apiRateLimit(), async (req, res) => {
    try {
        const payload = { ...req.body };
        payload.title = sanitizeHtmlBasic(payload.title);
        payload.titleEn = sanitizeHtmlBasic(payload.titleEn);
        payload.content = sanitizeHtmlBasic(payload.content);
        payload.contentEn = sanitizeHtmlBasic(payload.contentEn);
        const article = await articleModel.createArticle(payload);
        res.json({ success: true, data: article });
    } catch (error) {
        console.error('创建文章失败:', error);
        res.status(500).json({ success: false, message: '创建文章失败' });
    }
});

app.put('/api/admin/articles/:id', checkAdminAuth, rateLimit.apiRateLimit(), async (req, res) => {
    try {
        const payload = { ...req.body };
        payload.title = sanitizeHtmlBasic(payload.title);
        payload.titleEn = sanitizeHtmlBasic(payload.titleEn);
        payload.content = sanitizeHtmlBasic(payload.content);
        payload.contentEn = sanitizeHtmlBasic(payload.contentEn);
        const article = await articleModel.updateArticle(req.params.id, payload);
        if (article) {
            res.json({ success: true, data: article });
        } else {
            res.status(404).json({ success: false, message: '文章不存在' });
        }
    } catch (error) {
        console.error('更新文章失败:', error);
        res.status(500).json({ success: false, message: '更新文章失败' });
    }
});

app.delete('/api/admin/articles/:id', checkAdminAuth, rateLimit.apiRateLimit(), async (req, res) => {
    try {
        const article = await articleModel.deleteArticle(req.params.id);
        if (article) {
            res.json({ success: true, message: '删除成功' });
        } else {
            res.status(404).json({ success: false, message: '文章不存在' });
        }
    } catch (error) {
        console.error('删除文章失败:', error);
        res.status(500).json({ success: false, message: '删除文章失败' });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'SABER咨询网站运行正常',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 页面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-email.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: '页面不存在' 
    });
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({ 
        success: false, 
        message: '服务器内部错误' 
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 SABER咨询网站服务器运行在 http://localhost:${PORT}`);
    console.log(`📧 邮件服务: ${config.email}`);
    console.log(`🗄️  数据库: ${config.database.host}:${config.database.port}/${config.database.database}`);
    console.log(`🌍 环境: ${config.server.environment}`);
    
    if (config.server.environment === 'development') {
        console.log('\n📋 开发模式链接:');
        console.log(`   🌐 网站首页: http://localhost:${PORT}`);
        console.log(`   🔧 管理后台: http://localhost:${PORT}/admin`);
        console.log(`   📧 邮件测试: http://localhost:${PORT}/test`);
        console.log(`   💚 健康检查: http://localhost:${PORT}/api/health`);
    }
});
