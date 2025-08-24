const ArticleModel = require('../models/article');

async function testDatabase() {
    try {
        console.log('🧪 开始测试数据库功能...\n');
        
        // 测试获取所有文章
        console.log('1. 测试获取所有文章...');
        const allArticles = await ArticleModel.getAllArticles();
        console.log(`✅ 成功获取 ${allArticles.length} 篇文章`);
        allArticles.forEach(article => {
            console.log(`   - ${article.title} (${article.category})`);
        });
        
        // 测试根据分类获取文章
        console.log('\n2. 测试根据分类获取文章...');
        const certificationArticles = await ArticleModel.getArticlesByCategory('certification');
        console.log(`✅ 认证分类文章数量: ${certificationArticles.length}`);
        
        // 测试获取热门文章
        console.log('\n3. 测试获取热门文章...');
        const popularArticles = await ArticleModel.getPopularArticles(3);
        console.log(`✅ 热门文章数量: ${popularArticles.length}`);
        popularArticles.forEach(article => {
            console.log(`   - ${article.title} (${article.views} 次浏览)`);
        });
        
        // 测试获取最新文章
        console.log('\n4. 测试获取最新文章...');
        const latestArticles = await ArticleModel.getLatestArticles(3);
        console.log(`✅ 最新文章数量: ${latestArticles.length}`);
        
        // 测试搜索功能
        console.log('\n5. 测试搜索功能...');
        const searchResults = await ArticleModel.searchArticles('SABER');
        console.log(`✅ 搜索"SABER"结果数量: ${searchResults.length}`);
        
        // 测试获取分类统计
        console.log('\n6. 测试获取分类统计...');
        const categoryStats = await ArticleModel.getCategoryStats();
        console.log('✅ 分类统计:');
        categoryStats.forEach(stat => {
            console.log(`   - ${stat.category}: ${stat.total_articles} 篇文章, ${stat.total_views} 次浏览`);
        });
        
        console.log('\n🎉 所有数据库功能测试通过！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        process.exit(1);
    }
}

// 运行测试
testDatabase();
