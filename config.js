// 邮箱配置
module.exports = {
    // QQ邮箱配置
    qqEmail: {
        host: 'smtp.qq.com',
        port: 465,
        secure: true,
        auth: {
            user: 'shen.5109256@qq.com',
            pass: process.env.QQ_EMAIL_PASS || 'your-qq-auth-code' // 请设置环境变量或替换为您的QQ邮箱授权码
        }
    },
    // 华为企业邮箱配置
    huaweiEmail: {
        host: 'smtp.huawei.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.HUAWEI_EMAIL_USER || 'your-email@your-domain.com', // 替换为您的华为企业邮箱
            pass: process.env.HUAWEI_EMAIL_PASS || 'your-auth-code' // 替换为您的授权码
        }
    },
    // 当前使用的邮箱配置（可选：qqEmail 或 huaweiEmail）
    email: 'qqEmail', // 默认使用QQ邮箱
    // 接收咨询的邮箱地址
    receiveEmail: 'shen.5109256@qq.com',
    // 网站配置
    website: {
        name: 'SABER专业咨询',
        nameEn: 'SABER Professional Consulting',
        description: '沙特市场准入专家',
        descriptionEn: 'Saudi Market Access Expert'
    },
    // 管理后台配置
    admin: {
        username: process.env.ADMIN_USERNAME || 'Sy321098',
        password: process.env.ADMIN_PASSWORD || 'Sy098321'
    },
    // 数据库配置
    database: {
        host: process.env.DB_HOST || '120.55.113.85',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Sy510925@',
        database: process.env.DB_NAME || 'saber_consulting',
        port: process.env.DB_PORT || 3306
    },
    // 服务器配置
    server: {
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || 'development'
    }
};
