// MySQL数据库 - 文章数据模型
const { query, transaction } = require('./database');

class ArticleModel {
    // 获取所有文章
    async getAllArticles() {
        const sql = 'SELECT * FROM articles WHERE status = ? ORDER BY created_at DESC';
        const articles = await query(sql, ['published']);
        return articles.map(this.formatArticle);
    }

    // 根据ID获取文章
    async getArticleById(id) {
        const sql = 'SELECT * FROM articles WHERE id = ?';
        const articles = await query(sql, [id]);
        return articles.length > 0 ? this.formatArticle(articles[0]) : null;
    }

    // 根据分类获取文章
    async getArticlesByCategory(category) {
        const sql = 'SELECT * FROM articles WHERE category = ? AND status = ? ORDER BY created_at DESC';
        const articles = await query(sql, [category, 'published']);
        return articles.map(this.formatArticle);
    }

    // 创建新文章
    async createArticle(articleData) {
        const sql = `
            INSERT INTO articles (title, title_en, content, content_en, category, author, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await query(sql, [
            articleData.title,
            articleData.titleEn,
            articleData.content,
            articleData.contentEn,
            articleData.category,
            articleData.author || 'SABER专家',
            'published'
        ]);
        
        return this.getArticleById(result.insertId);
    }

    // 更新文章
    async updateArticle(id, updateData) {
        const sql = `
            UPDATE articles 
            SET title = ?, title_en = ?, content = ?, content_en = ?, category = ?, author = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        await query(sql, [
            updateData.title,
            updateData.titleEn,
            updateData.content,
            updateData.contentEn,
            updateData.category,
            updateData.author || 'SABER专家',
            id
        ]);
        
        return this.getArticleById(id);
    }

    // 删除文章
    async deleteArticle(id) {
        const article = await this.getArticleById(id);
        if (!article) return null;
        
        const sql = 'DELETE FROM articles WHERE id = ?';
        await query(sql, [id]);
        
        return article;
    }

    // 搜索文章
    async searchArticles(keyword) {
        const sql = `
            SELECT * FROM articles 
            WHERE status = ? AND (
                title LIKE ? OR content LIKE ? OR 
                title_en LIKE ? OR content_en LIKE ?
            )
            ORDER BY created_at DESC
        `;
        const searchTerm = `%${keyword}%`;
        const articles = await query(sql, ['published', searchTerm, searchTerm, searchTerm, searchTerm]);
        return articles.map(this.formatArticle);
    }

    // 增加文章浏览次数
    async incrementViews(id) {
        const sql = 'UPDATE articles SET views = views + 1 WHERE id = ?';
        await query(sql, [id]);
        
        // 同时更新统计表
        const statsSql = `
            INSERT INTO article_stats (article_id, views) 
            VALUES (?, 1) 
            ON DUPLICATE KEY UPDATE views = views + 1
        `;
        await query(statsSql, [id]);
    }

    // 获取文章统计
    async getArticleStats() {
        const sql = `
            SELECT 
                a.id,
                a.title,
                a.category,
                a.views as article_views,
                COALESCE(s.views, 0) as total_views,
                COALESCE(s.shares, 0) as total_shares,
                COALESCE(s.likes, 0) as total_likes
            FROM articles a
            LEFT JOIN article_stats s ON a.id = s.article_id
            WHERE a.status = 'published'
            ORDER BY a.views DESC
        `;
        return await query(sql);
    }

    // 获取热门文章
    async getPopularArticles(limit = 5) {
        const sql = `
            SELECT * FROM articles 
            WHERE status = 'published' 
            ORDER BY views DESC 
            LIMIT ${parseInt(limit)}
        `;
        const articles = await query(sql);
        return articles.map(this.formatArticle);
    }

    // 获取最新文章
    async getLatestArticles(limit = 5) {
        const sql = `
            SELECT * FROM articles 
            WHERE status = 'published' 
            ORDER BY created_at DESC 
            LIMIT ${parseInt(limit)}
        `;
        const articles = await query(sql);
        return articles.map(this.formatArticle);
    }

    // 获取分类统计
    async getCategoryStats() {
        const sql = `
            SELECT 
                category,
                COUNT(*) as total_articles,
                SUM(views) as total_views
            FROM articles 
            WHERE status = 'published'
            GROUP BY category
            ORDER BY total_views DESC
        `;
        return await query(sql);
    }

    // 格式化文章数据
    formatArticle(article) {
        return {
            id: article.id,
            title: article.title,
            titleEn: article.title_en,
            content: article.content,
            contentEn: article.content_en,
            category: article.category,
            status: article.status,
            author: article.author,
            views: article.views || 0,
            createdAt: article.created_at,
            updatedAt: article.updated_at
        };
    }

    // 批量操作
    async batchUpdateStatus(ids, status) {
        const sql = 'UPDATE articles SET status = ? WHERE id IN (?)';
        await query(sql, [status, ids]);
        return ids.length;
    }

    // 获取文章摘要（用于列表显示）
    async getArticleSummaries(limit = 10, offset = 0) {
        const sql = `
            SELECT 
                id, title, title_en, category, author, views, created_at,
                LEFT(content, 200) as content_preview,
                LEFT(content_en, 200) as content_en_preview
            FROM articles 
            WHERE status = 'published' 
            ORDER BY created_at DESC 
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
        const articles = await query(sql);
        return articles.map(article => ({
            id: article.id,
            title: article.title,
            titleEn: article.title_en,
            category: article.category,
            author: article.author,
            views: article.views || 0,
            contentPreview: article.content_preview + '...',
            contentEnPreview: article.content_en_preview + '...',
            createdAt: article.created_at
        }));
    }
}

module.exports = new ArticleModel();
