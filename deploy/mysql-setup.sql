-- SABER咨询网站数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS saber_consulting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saber_consulting;

-- 文章表
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '中文标题',
    title_en VARCHAR(255) NOT NULL COMMENT '英文标题',
    content TEXT NOT NULL COMMENT '中文内容',
    content_en TEXT NOT NULL COMMENT '英文内容',
    category ENUM('certification', 'pcoc', 'scoc', 'gcc', 'news') NOT NULL COMMENT '分类',
    author VARCHAR(100) DEFAULT 'SABER专家' COMMENT '作者',
    status ENUM('draft', 'published', 'archived') DEFAULT 'published' COMMENT '状态',
    views INT DEFAULT 0 COMMENT '浏览次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- 咨询记录表
CREATE TABLE IF NOT EXISTS inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    email VARCHAR(100) NOT NULL COMMENT '邮箱',
    company VARCHAR(200) COMMENT '公司名称',
    phone VARCHAR(20) COMMENT '电话',
    service VARCHAR(100) COMMENT '服务类型',
    message TEXT NOT NULL COMMENT '咨询内容',
    status ENUM('new', 'processing', 'completed', 'archived') DEFAULT 'new' COMMENT '处理状态',
    admin_notes TEXT COMMENT '管理员备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='咨询记录表';

-- 聊天消息表
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    email VARCHAR(100) NOT NULL COMMENT '邮箱',
    message TEXT NOT NULL COMMENT '消息内容',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    status ENUM('unread', 'read', 'replied') DEFAULT 'unread' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天消息表';

-- 文章统计表
CREATE TABLE IF NOT EXISTS article_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL COMMENT '文章ID',
    views INT DEFAULT 0 COMMENT '浏览次数',
    shares INT DEFAULT 0 COMMENT '分享次数',
    likes INT DEFAULT 0 COMMENT '点赞次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章统计表';

-- 系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE COMMENT '设置键',
    setting_value TEXT COMMENT '设置值',
    description VARCHAR(255) COMMENT '描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统设置表';

-- 插入默认文章数据
INSERT INTO articles (title, title_en, content, content_en, category, author) VALUES
('SABER认证流程详解', 'SABER Certification Process Guide', 
'<h2>SABER认证流程详解</h2><p>SABER（Saudi Product Safety Program）是沙特阿拉伯的产品安全计划，所有进口到沙特的产品都需要通过SABER系统进行认证。</p><h3>认证流程包括：</h3><ul><li>产品注册</li><li>技术文件准备</li><li>测试报告获取</li><li>证书申请</li><li>证书签发</li></ul>',
'<h2>SABER Certification Process Guide</h2><p>SABER (Saudi Product Safety Program) is Saudi Arabia\'s product safety program. All products imported into Saudi Arabia need to be certified through the SABER system.</p><h3>The certification process includes:</h3><ul><li>Product registration</li><li>Technical documentation preparation</li><li>Test report acquisition</li><li>Certificate application</li><li>Certificate issuance</li></ul>',
'certification', 'SABER专家'),

('PCOC认证申请指南', 'PCOC Certification Application Guide',
'<h2>PCOC认证申请指南</h2><p>PCOC（Product Conformity Certificate）是产品符合性证书，是SABER系统的重要组成部分。</p><h3>申请步骤：</h3><ol><li>在SABER系统注册账户</li><li>选择认证机构</li><li>提交技术文件</li><li>进行产品测试</li><li>获得PCOC证书</li></ol>',
'<h2>PCOC Certification Application Guide</h2><p>PCOC (Product Conformity Certificate) is a product conformity certificate and an important component of the SABER system.</p><h3>Application steps:</h3><ol><li>Register an account in the SABER system</li><li>Select a certification body</li><li>Submit technical documentation</li><li>Conduct product testing</li><li>Obtain PCOC certificate</li></ol>',
'pcoc', 'SABER专家'),

('SCOC认证要求说明', 'SCOC Certification Requirements',
'<h2>SCOC认证要求说明</h2><p>SCOC（Shipment Conformity Certificate）是装运符合性证书，用于确保每批货物的合规性。</p><h3>主要要求：</h3><ul><li>有效的PCOC证书</li><li>完整的装运文件</li><li>产品标识和标签</li><li>符合沙特标准</li></ul>',
'<h2>SCOC Certification Requirements</h2><p>SCOC (Shipment Conformity Certificate) is a shipment conformity certificate used to ensure compliance of each shipment.</p><h3>Main requirements:</h3><ul><li>Valid PCOC certificate</li><li>Complete shipping documentation</li><li>Product identification and labeling</li><li>Compliance with Saudi standards</li></ul>',
'scoc', 'SABER专家'),

('GCC认证最新政策', 'Latest GCC Certification Policy',
'<h2>GCC认证最新政策</h2><p>海湾合作委员会（GCC）认证覆盖多个海湾国家，包括沙特阿拉伯、阿联酋、科威特等。</p><h3>政策更新：</h3><ul><li>统一认证标准</li><li>简化申请流程</li><li>电子化证书管理</li><li>加强市场监管</li></ul>',
'<h2>Latest GCC Certification Policy</h2><p>Gulf Cooperation Council (GCC) certification covers multiple Gulf countries including Saudi Arabia, UAE, Kuwait, etc.</p><h3>Policy updates:</h3><ul><li>Unified certification standards</li><li>Simplified application process</li><li>Electronic certificate management</li><li>Enhanced market supervision</li></ul>',
'gcc', 'SABER专家'),

('沙特SABER系统升级通知', 'Saudi SABER System Upgrade Notice',
'<h2>沙特SABER系统升级通知</h2><p>沙特标准局（SASO）宣布SABER系统将于2024年进行全面升级，提升用户体验和系统性能。</p><h3>升级内容：</h3><ul><li>界面优化</li><li>功能增强</li><li>处理速度提升</li><li>安全性加强</li></ul>',
'<h2>Saudi SABER System Upgrade Notice</h2><p>The Saudi Standards, Metrology and Quality Organization (SASO) announced that the SABER system will undergo a comprehensive upgrade in 2024 to improve user experience and system performance.</p><h3>Upgrade content:</h3><ul><li>Interface optimization</li><li>Feature enhancement</li><li>Processing speed improvement</li><li>Security enhancement</li></ul>',
'news', 'SABER专家');

-- 插入默认系统设置
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('site_name', 'SABER专业咨询', '网站名称'),
('site_name_en', 'SABER Professional Consulting', '英文网站名称'),
('contact_email', 'shen.5109256@qq.com', '联系邮箱'),
('contact_phone', '+86 138-0000-0000', '联系电话'),
('company_address', '中国上海市浦东新区', '公司地址'),
('company_address_en', 'Pudong New District, Shanghai, China', '英文公司地址'),
('email_notifications', 'true', '是否启用邮件通知'),
('max_articles_per_page', '10', '每页显示文章数量'),
('maintenance_mode', 'false', '维护模式');

-- 创建索引
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_created_at ON articles(created_at);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX idx_chat_messages_status ON chat_messages(status);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- 创建视图
CREATE VIEW article_summary AS
SELECT 
    a.id,
    a.title,
    a.title_en,
    a.category,
    a.author,
    a.status,
    a.views,
    a.created_at,
    COALESCE(s.views, 0) as total_views,
    COALESCE(s.shares, 0) as total_shares,
    COALESCE(s.likes, 0) as total_likes
FROM articles a
LEFT JOIN article_stats s ON a.id = s.article_id
WHERE a.status = 'published';

-- 显示创建结果
SELECT 'Database and tables created successfully!' as message;
SELECT COUNT(*) as article_count FROM articles;
SELECT COUNT(*) as inquiry_count FROM inquiries;
