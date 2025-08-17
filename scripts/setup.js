#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 SABER咨询网站项目设置开始...\n');

// 检查Node.js版本
const nodeVersion = process.version;
console.log(`📦 Node.js版本: ${nodeVersion}`);

if (parseInt(nodeVersion.slice(1).split('.')[0]) < 14) {
    console.error('❌ 需要Node.js 14.0.0或更高版本');
    process.exit(1);
}

// 检查是否存在.env文件
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        console.log('📝 创建.env配置文件...');
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ .env文件已创建，请编辑配置文件');
    } else {
        console.log('⚠️  未找到env.example文件，请手动创建.env文件');
    }
} else {
    console.log('✅ .env文件已存在');
}

// 安装依赖
console.log('\n📦 安装项目依赖...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ 依赖安装完成');
} catch (error) {
    console.error('❌ 依赖安装失败:', error.message);
    process.exit(1);
}

// 检查MySQL连接
console.log('\n🗄️  检查数据库连接...');
const config = require('../config');
const { testConnection } = require('../models/database');

testConnection().then(success => {
    if (success) {
        console.log('✅ 数据库连接成功');
    } else {
        console.log('⚠️  数据库连接失败，请检查配置');
        console.log('💡 运行以下命令初始化数据库:');
        console.log('   npm run db:init');
    }
});

// 检查邮箱配置
console.log('\n📧 检查邮箱配置...');
const emailConfig = config[config.email];
if (emailConfig && emailConfig.auth.pass !== 'your-qq-auth-code') {
    console.log('✅ 邮箱配置已设置');
} else {
    console.log('⚠️  请配置邮箱授权码');
    console.log('💡 编辑.env文件中的QQ_EMAIL_PASS或HUAWEI_EMAIL_PASS');
}

console.log('\n🎉 项目设置完成！');
console.log('\n📋 下一步操作:');
console.log('1. 编辑.env文件配置数据库和邮箱信息');
console.log('2. 运行 npm run db:init 初始化数据库');
console.log('3. 运行 npm run dev 启动开发服务器');
console.log('4. 访问 http://localhost:3000 查看网站');
console.log('5. 访问 http://localhost:3000/admin 进入管理后台');
