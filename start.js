#!/usr/bin/env node

console.log('🚀 SABER咨询网站启动中...');
console.log('================================');

// 检查Node.js版本
const nodeVersion = process.version;
console.log(`📦 Node.js版本: ${nodeVersion}`);

// 检查必要文件
const fs = require('fs');
const path = require('path');

const requiredFiles = ['server.js', 'package.json', 'index.html'];
for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
        console.error(`❌ 缺少必要文件: ${file}`);
        process.exit(1);
    }
}

// 检查依赖是否安装
if (!fs.existsSync('node_modules')) {
    console.log('📦 正在安装依赖...');
    const { execSync } = require('child_process');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ 依赖安装完成');
    } catch (error) {
        console.error('❌ 依赖安装失败');
        process.exit(1);
    }
}

// 创建.env文件（如果不存在）
if (!fs.existsSync('.env')) {
    console.log('📝 创建配置文件...');
    const envContent = `# SABER咨询网站配置
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=saber_consulting
DB_PORT=3306
QQ_EMAIL_PASS=your-qq-email-auth-code
ADMIN_USERNAME=Sy321098
ADMIN_PASSWORD=Sy098321
EMAIL_NOTIFICATIONS=true
RECEIVE_EMAIL=shen.5109256@qq.com`;
    
    fs.writeFileSync('.env', envContent);
    console.log('✅ 配置文件已创建');
    console.log('⚠️  请编辑.env文件配置邮箱授权码');
}

console.log('\n🎉 启动完成！');
console.log('📋 访问地址:');
console.log('   🌐 网站首页: http://localhost:3000');
console.log('   🔧 管理后台: http://localhost:3000/admin');
console.log('   📧 邮件测试: http://localhost:3000/test');
console.log('\n💡 提示: 如果没有MySQL，系统会自动使用Mock数据模式');

// 启动服务器
require('./server.js');
