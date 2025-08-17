const mysql = require('mysql2/promise');
const config = require('../config');

// Mock数据
const mockData = {
    articles: [
        {
            id: 1,
            title: 'SABER认证流程详解',
            title_en: 'SABER Certification Process Guide',
            content: '<h2>SABER认证流程详解</h2><p>SABER（Saudi Product Safety Program）是沙特阿拉伯的产品安全计划，所有进口到沙特的产品都需要通过SABER系统进行认证。</p><h3>认证流程包括：</h3><ul><li>产品注册</li><li>技术文件准备</li><li>测试报告获取</li><li>证书申请</li><li>证书签发</li></ul>',
            content_en: '<h2>SABER Certification Process Guide</h2><p>SABER (Saudi Product Safety Program) is Saudi Arabia\'s product safety program. All products imported into Saudi Arabia need to be certified through the SABER system.</p><h3>The certification process includes:</h3><ul><li>Product registration</li><li>Technical documentation preparation</li><li>Test report acquisition</li><li>Certificate application</li><li>Certificate issuance</li></ul>',
            category: 'certification',
            author: 'SABER专家',
            status: 'published',
            views: 156,
            created_at: '2024-01-15 10:00:00',
            updated_at: '2024-01-15 10:00:00'
        },
        {
            id: 2,
            title: 'PCOC认证申请指南',
            title_en: 'PCOC Certification Application Guide',
            content: '<h2>PCOC认证申请指南</h2><p>PCOC（Product Conformity Certificate）是产品符合性证书，是SABER系统的重要组成部分。</p><h3>申请步骤：</h3><ol><li>在SABER系统注册账户</li><li>选择认证机构</li><li>提交技术文件</li><li>进行产品测试</li><li>获得PCOC证书</li></ol>',
            content_en: '<h2>PCOC Certification Application Guide</h2><p>PCOC (Product Conformity Certificate) is a product conformity certificate and an important component of the SABER system.</p><h3>Application steps:</h3><ol><li>Register an account in the SABER system</li><li>Select a certification body</li><li>Submit technical documentation</li><li>Conduct product testing</li><li>Obtain PCOC certificate</li></ol>',
            category: 'pcoc',
            author: 'SABER专家',
            status: 'published',
            views: 89,
            created_at: '2024-01-16 14:30:00',
            updated_at: '2024-01-16 14:30:00'
        },
        {
            id: 3,
            title: 'SCOC认证要求说明',
            title_en: 'SCOC Certification Requirements',
            content: '<h2>SCOC认证要求说明</h2><p>SCOC（Shipment Conformity Certificate）是装运符合性证书，用于确保每批货物的合规性。</p><h3>主要要求：</h3><ul><li>有效的PCOC证书</li><li>完整的装运文件</li><li>产品标识和标签</li><li>符合沙特标准</li></ul>',
            content_en: '<h2>SCOC Certification Requirements</h2><p>SCOC (Shipment Conformity Certificate) is a shipment conformity certificate used to ensure compliance of each shipment.</p><h3>Main requirements:</h3><ul><li>Valid PCOC certificate</li><li>Complete shipping documentation</li><li>Product identification and labeling</li><li>Compliance with Saudi standards</li></ul>',
            category: 'scoc',
            author: 'SABER专家',
            status: 'published',
            views: 67,
            created_at: '2024-01-17 09:15:00',
            updated_at: '2024-01-17 09:15:00'
        },
        {
            id: 4,
            title: 'GCC认证最新政策',
            title_en: 'Latest GCC Certification Policy',
            content: '<h2>GCC认证最新政策</h2><p>海湾合作委员会（GCC）认证覆盖多个海湾国家，包括沙特阿拉伯、阿联酋、科威特等。</p><h3>政策更新：</h3><ul><li>统一认证标准</li><li>简化申请流程</li><li>电子化证书管理</li><li>加强市场监管</li></ul>',
            content_en: '<h2>Latest GCC Certification Policy</h2><p>Gulf Cooperation Council (GCC) certification covers multiple Gulf countries including Saudi Arabia, UAE, Kuwait, etc.</p><h3>Policy updates:</h3><ul><li>Unified certification standards</li><li>Simplified application process</li><li>Electronic certificate management</li><li>Enhanced market supervision</li></ul>',
            category: 'gcc',
            author: 'SABER专家',
            status: 'published',
            views: 123,
            created_at: '2024-01-18 16:45:00',
            updated_at: '2024-01-18 16:45:00'
        },
        {
            id: 5,
            title: '沙特SABER系统升级通知',
            title_en: 'Saudi SABER System Upgrade Notice',
            content: '<h2>沙特SABER系统升级通知</h2><p>沙特标准局（SASO）宣布SABER系统将于2024年进行全面升级，提升用户体验和系统性能。</p><h3>升级内容：</h3><ul><li>界面优化</li><li>功能增强</li><li>处理速度提升</li><li>安全性加强</li></ul>',
            content_en: '<h2>Saudi SABER System Upgrade Notice</h2><p>The Saudi Standards, Metrology and Quality Organization (SASO) announced that the SABER system will undergo a comprehensive upgrade in 2024 to improve user experience and system performance.</p><h3>Upgrade content:</h3><ul><li>Interface optimization</li><li>Feature enhancement</li><li>Processing speed improvement</li><li>Security enhancement</li></ul>',
            category: 'news',
            author: 'SABER专家',
            status: 'published',
            views: 234,
            created_at: '2024-01-19 11:20:00',
            updated_at: '2024-01-19 11:20:00'
        }
    ],
    inquiries: [],
    chatMessages: []
};

// 数据库连接池
let pool = null;
let useMockData = false;

// 测试数据库连接
async function testConnection() {
    try {
        if (!pool) {
            pool = mysql.createPool({
                host: config.database.host,
                user: config.database.user,
                password: config.database.password,
                database: config.database.database,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                charset: 'utf8mb4'
            });
        }
        
        const connection = await pool.getConnection();
        console.log('✅ 数据库连接成功！');
        connection.release();
        useMockData = false;
        return true;
    } catch (error) {
        console.log('⚠️ 数据库连接失败，使用Mock数据模式');
        useMockData = true;
        return false;
    }
}

// 执行查询
async function query(sql, params = []) {
    if (useMockData) {
        // Mock数据模式
        if (sql.trim().toUpperCase().startsWith('INSERT')) {
            return handleMockInsert(sql, params);
        } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
            return handleMockUpdate(sql, params);
        } else if (sql.trim().toUpperCase().startsWith('DELETE')) {
            return handleMockDelete(sql, params);
        } else {
            // SELECT查询
            return getMockData(sql, params);
        }
    }
    
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('数据库查询错误:', error);
        throw error;
    }
}

// 获取Mock数据
function getMockData(sql, params) {
    // 简单的SQL解析来返回相应的Mock数据
    if (sql.includes('articles') && sql.includes('SELECT')) {
        if (sql.includes('WHERE id = ?')) {
            const id = params[0];
            return mockData.articles.filter(article => article.id === id);
        } else if (sql.includes('WHERE category = ?')) {
            const category = params[0];
            return mockData.articles.filter(article => article.category === category);
        } else if (sql.includes('WHERE status = ?')) {
            return mockData.articles;
        } else {
            return mockData.articles;
        }
    } else if (sql.includes('inquiries') && sql.includes('SELECT')) {
        return mockData.inquiries;
    } else if (sql.includes('chat_messages') && sql.includes('SELECT')) {
        return mockData.chatMessages;
    }
    
    return [];
}

// 处理Mock数据的INSERT操作
function handleMockInsert(sql, params) {
    if (sql.includes('INSERT INTO articles')) {
        const newId = Math.max(...mockData.articles.map(a => a.id), 0) + 1;
        const newArticle = {
            id: newId,
            title: params[0],
            title_en: params[1],
            content: params[2],
            content_en: params[3],
            category: params[4],
            author: params[5],
            status: params[6],
            views: 0,
            created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        mockData.articles.push(newArticle);
        return { insertId: newId };
    }
    return { insertId: 1 };
}

// 处理Mock数据的UPDATE操作
function handleMockUpdate(sql, params) {
    if (sql.includes('UPDATE articles') && sql.includes('WHERE id = ?')) {
        const id = params[params.length - 1]; // 最后一个参数是ID
        const articleIndex = mockData.articles.findIndex(a => a.id === id);
        if (articleIndex !== -1) {
            mockData.articles[articleIndex] = {
                ...mockData.articles[articleIndex],
                title: params[0],
                title_en: params[1],
                content: params[2],
                content_en: params[3],
                category: params[4],
                author: params[5],
                updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            };
        }
    }
    return { affectedRows: 1 };
}

// 处理Mock数据的DELETE操作
function handleMockDelete(sql, params) {
    if (sql.includes('DELETE FROM articles') && sql.includes('WHERE id = ?')) {
        const id = params[0];
        const articleIndex = mockData.articles.findIndex(a => a.id === id);
        if (articleIndex !== -1) {
            const deletedArticle = mockData.articles[articleIndex];
            mockData.articles.splice(articleIndex, 1);
            return { affectedRows: 1, deletedArticle };
        }
    }
    return { affectedRows: 0 };
}

// 执行事务
async function transaction(callback) {
    if (useMockData) {
        // Mock模式下直接执行回调
        return await callback({
            execute: async (sql, params) => {
                return [getMockData(sql, params)];
            }
        });
    }
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    testConnection,
    query,
    transaction,
    useMockData: () => useMockData
};
