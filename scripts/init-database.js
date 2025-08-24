const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// 数据库连接配置
const dbConfig = {
    host: '120.55.113.85',
    user: 'root',
    password: 'Sy510925@',
    port: 3306
};

async function initDatabase() {
    let connection;
    
    try {
        console.log('🔌 正在连接到MySQL数据库...');
        
        // 连接到MySQL（不指定数据库）
        connection = await mysql.createConnection({
            ...dbConfig,
            database: undefined
        });
        
        console.log('✅ MySQL连接成功！');
        
        // 创建数据库
        console.log('📄 正在创建数据库...');
        await connection.query('CREATE DATABASE IF NOT EXISTS saber_consulting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        console.log('✅ 数据库创建成功！');
        
        // 切换到新创建的数据库
        await connection.query('USE saber_consulting');
        console.log('✅ 切换到saber_consulting数据库');
        
        // 创建表
        console.log('📋 正在创建表结构...');
        
        // 文章表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS articles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL COMMENT '中文标题',
                title_en VARCHAR(255) NOT NULL COMMENT '英文标题',
                content TEXT NOT NULL COMMENT '中文内容',
                content_en TEXT NOT NULL COMMENT '英文内容',
                category VARCHAR(50) NOT NULL COMMENT '分类',
                author VARCHAR(100) DEFAULT 'SABER专家' COMMENT '作者',
                status ENUM('draft', 'published', 'archived') DEFAULT 'published' COMMENT '状态',
                views INT DEFAULT 0 COMMENT '浏览次数',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                INDEX idx_category (category),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at),
                INDEX idx_views (views)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表'
        `);
        
        // 咨询表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS inquiries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL COMMENT '姓名',
                email VARCHAR(100) NOT NULL COMMENT '邮箱',
                phone VARCHAR(20) COMMENT '电话',
                company VARCHAR(200) COMMENT '公司',
                subject VARCHAR(200) NOT NULL COMMENT '咨询主题',
                message TEXT NOT NULL COMMENT '咨询内容',
                status ENUM('new', 'processing', 'completed', 'cancelled') DEFAULT 'new' COMMENT '状态',
                ip_address VARCHAR(45) COMMENT 'IP地址',
                user_agent TEXT COMMENT '用户代理',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                INDEX idx_status (status),
                INDEX idx_created_at (created_at),
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='咨询表'
        `);
        
        // 聊天消息表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id VARCHAR(100) NOT NULL COMMENT '会话ID',
                user_message TEXT NOT NULL COMMENT '用户消息',
                bot_response TEXT NOT NULL COMMENT '机器人回复',
                category VARCHAR(50) COMMENT '分类',
                ip_address VARCHAR(45) COMMENT 'IP地址',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                INDEX idx_session_id (session_id),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天消息表'
        `);
        
        // 文章统计表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS article_stats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                article_id INT NOT NULL COMMENT '文章ID',
                views INT DEFAULT 0 COMMENT '浏览次数',
                shares INT DEFAULT 0 COMMENT '分享次数',
                likes INT DEFAULT 0 COMMENT '点赞次数',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                UNIQUE KEY uk_article_id (article_id),
                FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
                INDEX idx_views (views)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章统计表'
        `);
        
        // 系统配置表
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS system_config (
                id INT AUTO_INCREMENT PRIMARY KEY,
                config_key VARCHAR(100) NOT NULL COMMENT '配置键',
                config_value TEXT COMMENT '配置值',
                description VARCHAR(255) COMMENT '描述',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                UNIQUE KEY uk_config_key (config_key)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表'
        `);
        
        console.log('✅ 表结构创建完成！');
        
        // 插入初始数据
        console.log('📝 正在插入初始数据...');
        
        // 检查是否已有数据
        const [existingArticles] = await connection.execute('SELECT COUNT(*) as count FROM articles');
        
        if (existingArticles[0].count === 0) {
            // 插入文章数据
            await connection.execute(`
                INSERT INTO articles (title, title_en, content, content_en, category, author, status, views) VALUES
                ('SABER认证流程详解', 'SABER Certification Process Guide', 
                '<h2>SABER认证流程详解</h2><p>SABER（Saudi Product Safety Program）是沙特阿拉伯的产品安全计划，所有进口到沙特的产品都需要通过SABER系统进行认证。</p><h3>认证流程包括：</h3><ul><li>产品注册</li><li>技术文件准备</li><li>测试报告获取</li><li>证书申请</li><li>证书签发</li></ul>',
                '<h2>SABER Certification Process Guide</h2><p>SABER (Saudi Product Safety Program) is Saudi Arabia\\'s product safety program. All products imported into Saudi Arabia need to be certified through the SABER system.</p><h3>The certification process includes:</h3><ul><li>Product registration</li><li>Technical documentation preparation</li><li>Test report acquisition</li><li>Certificate application</li><li>Certificate issuance</li></ul>',
                'certification', 'SABER专家', 'published', 156),
                
                ('PCOC认证申请指南', 'PCOC Certification Application Guide',
                '<h2>PCOC认证申请指南</h2><p>PCOC（Product Conformity Certificate）是产品符合性证书，是SABER系统的重要组成部分。</p><h3>申请步骤：</h3><ol><li>在SABER系统注册账户</li><li>选择认证机构</li><li>提交技术文件</li><li>进行产品测试</li><li>获得PCOC证书</li></ol>',
                '<h2>PCOC Certification Application Guide</h2><p>PCOC (Product Conformity Certificate) is a product conformity certificate and an important component of the SABER system.</p><h3>Application steps:</h3><ol><li>Register an account in the SABER system</li><li>Select a certification body</li><li>Submit technical documentation</li><li>Conduct product testing</li><li>Obtain PCOC certificate</li></ol>',
                'pcoc', 'SABER专家', 'published', 89),
                
                ('SCOC认证要求说明', 'SCOC Certification Requirements',
                '<h2>SCOC认证要求说明</h2><p>SCOC（Shipment Conformity Certificate）是装运符合性证书，用于确保每批货物的合规性。</p><h3>主要要求：</h3><ul><li>有效的PCOC证书</li><li>完整的装运文件</li><li>产品标识和标签</li><li>符合沙特标准</li></ul>',
                '<h2>SCOC Certification Requirements</h2><p>SCOC (Shipment Conformity Certificate) is a shipment conformity certificate used to ensure compliance of each shipment.</p><h3>Main requirements:</h3><ul><li>Valid PCOC certificate</li><li>Complete shipping documentation</li><li>Product identification and labeling</li><li>Compliance with Saudi standards</li></ul>',
                'scoc', 'SABER专家', 'published', 67),
                
                ('GCC认证最新政策', 'Latest GCC Certification Policy',
                '<h2>GCC认证最新政策</h2><p>海湾合作委员会（GCC）认证覆盖多个海湾国家，包括沙特阿拉伯、阿联酋、科威特等。</p><h3>政策更新：</h3><ul><li>统一认证标准</li><li>简化申请流程</li><li>电子化证书管理</li><li>加强市场监管</li></ul>',
                '<h2>Latest GCC Certification Policy</h2><p>Gulf Cooperation Council (GCC) certification covers multiple Gulf countries including Saudi Arabia, UAE, Kuwait, etc.</p><h3>Policy updates:</h3><ul><li>Unified certification standards</li><li>Simplified application process</li><li>Electronic certificate management</li><li>Enhanced market supervision</li></ul>',
                'gcc', 'SABER专家', 'published', 123),
                
                ('沙特SABER系统升级通知', 'Saudi SABER System Upgrade Notice',
                '<h2>沙特SABER系统升级通知</h2><p>沙特标准局（SASO）宣布SABER系统将于2024年进行全面升级，提升用户体验和系统性能。</p><h3>升级内容：</h3><ul><li>界面优化</li><li>功能增强</li><li>处理速度提升</li><li>安全性加强</li></ul>',
                '<h2>Saudi SABER System Upgrade Notice</h2><p>The Saudi Standards, Metrology and Quality Organization (SASO) announced that the SABER system will undergo a comprehensive upgrade in 2024 to improve user experience and system performance.</p><h3>Upgrade content:</h3><ul><li>Interface optimization</li><li>Feature enhancement</li><li>Processing speed improvement</li><li>Security enhancement</li></ul>',
                'news', 'SABER专家', 'published', 234)
            `);
            
            // 插入系统配置
            await connection.execute(`
                INSERT INTO system_config (config_key, config_value, description) VALUES
                ('site_name', 'SABER专业咨询', '网站名称'),
                ('site_name_en', 'SABER Professional Consulting', '网站英文名称'),
                ('site_description', '沙特市场准入专家', '网站描述'),
                ('site_description_en', 'Saudi Market Access Expert', '网站英文描述'),
                ('contact_email', 'shen.5109256@qq.com', '联系邮箱'),
                ('admin_username', 'Sy321098', '管理员用户名'),
                ('version', '1.0.0', '系统版本')
            `);
            
            // 为现有文章创建统计记录
            await connection.execute(`
                INSERT INTO article_stats (article_id, views) 
                SELECT id, views FROM articles 
                ON DUPLICATE KEY UPDATE views = articles.views
            `);
            
            console.log('✅ 初始数据插入完成！');
        } else {
            console.log('ℹ️ 数据库中已有数据，跳过初始数据插入');
        }
        
        // 创建视图
        console.log('👁️ 正在创建视图...');
        await connection.execute(`
            CREATE OR REPLACE VIEW article_summary AS
            SELECT 
                a.id,
                a.title,
                a.title_en,
                a.category,
                a.author,
                a.views,
                a.created_at,
                LEFT(a.content, 200) as content_preview,
                LEFT(a.content_en, 200) as content_en_preview,
                COALESCE(s.views, 0) as total_views,
                COALESCE(s.shares, 0) as total_shares,
                COALESCE(s.likes, 0) as total_likes
            FROM articles a
            LEFT JOIN article_stats s ON a.id = s.article_id
            WHERE a.status = 'published'
        `);
        
        console.log('✅ 数据库初始化完成！');
        console.log('📊 数据库信息：');
        console.log('   - 数据库名：saber_consulting');
        console.log('   - 主机：120.55.113.85');
        console.log('   - 用户：root');
        
        // 验证数据库和表是否创建成功
        console.log('\n🔍 验证数据库结构...');
        
        // 检查表是否存在
        const [tables] = await connection.execute(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'saber_consulting'
        `);
        
        console.log('📋 已创建的表：');
        tables.forEach(table => {
            console.log(`   - ${table.table_name}`);
        });
        
        // 检查文章数据
        const [articles] = await connection.execute('SELECT COUNT(*) as count FROM articles');
        console.log(`📝 文章数量：${articles[0].count}`);
        
        // 检查咨询数据
        const [inquiries] = await connection.execute('SELECT COUNT(*) as count FROM inquiries');
        console.log(`📞 咨询数量：${inquiries[0].count}`);
        
        console.log('\n🎉 数据库初始化验证完成！');
        
    } catch (error) {
        console.error('❌ 数据库初始化失败：', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 请检查数据库用户名和密码是否正确');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('💡 请检查数据库主机地址和端口是否正确');
        } else if (error.code === 'ER_DBACCESS_DENIED_ERROR') {
            console.error('💡 请检查用户是否有创建数据库的权限');
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    initDatabase();
}

module.exports = initDatabase;
