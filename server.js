const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 邮件配置
const transporter = nodemailer.createTransporter(config.email);

// 处理咨询表单提交
app.post('/api/inquiry', async (req, res) => {
    try {
        const { name, email, message, subject, company, phone, service } = req.body;
        
        // 邮件内容
        const mailOptions = {
            from: config.email.auth.user,
            to: config.receiveEmail, // 您的接收邮箱
            subject: `SABER咨询 - ${subject}`,
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
        await transporter.sendMail(mailOptions);
        
        // 发送确认邮件给客户
        const confirmMailOptions = {
            from: config.email.auth.user,
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
        
        res.json({ success: true, message: '咨询已提交，我们将尽快与您联系！' });
        
    } catch (error) {
        console.error('发送邮件失败:', error);
        res.status(500).json({ success: false, message: '发送失败，请稍后重试' });
    }
});

// 处理浮动聊天消息
app.post('/api/chat', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        // 邮件内容
        const mailOptions = {
            from: config.email.auth.user,
            to: config.receiveEmail, // 您的接收邮箱
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
        await transporter.sendMail(mailOptions);
        
        res.json({ success: true, message: '消息已发送！' });
        
    } catch (error) {
        console.error('发送邮件失败:', error);
        res.status(500).json({ success: false, message: '发送失败，请稍后重试' });
    }
});

// 获取所有咨询记录
app.get('/api/inquiries', (req, res) => {
    // 这里可以从数据库获取咨询记录
    res.json({ message: '咨询记录功能待实现' });
});

// 主页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('请确保已配置正确的邮箱信息');
});
