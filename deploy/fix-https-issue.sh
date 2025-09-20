#!/bin/bash

# 修复HTTPS协议问题的脚本
# 适用于：解决前端API请求自动转换为HTTPS的问题

echo "🔧 修复HTTPS协议问题脚本"
echo "=========================="

# 检查项目目录
PROJECT_DIR="/opt/saber-consulting"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ 项目目录不存在: $PROJECT_DIR"
    exit 1
fi

cd $PROJECT_DIR

echo "📋 当前项目目录: $(pwd)"

# 备份原文件
echo "💾 备份原文件..."
cp admin.html admin.html.backup
cp index.html index.html.backup
cp test-email.html test-email.html.backup

echo "🔧 修复admin.html中的API请求..."
# 修复admin.html中的fetch请求，添加window.location.origin确保使用正确的协议
sed -i 's|fetch('\''/api/|fetch(window.location.origin + '\''/api/|g' admin.html

echo "🔧 修复index.html中的API请求..."
# 修复index.html中的fetch请求
sed -i 's|fetch('\''/api/|fetch(window.location.origin + '\''/api/|g' index.html

echo "🔧 修复test-email.html中的API请求..."
# 修复test-email.html中的fetch请求
sed -i 's|fetch(endpoint|fetch(window.location.origin + endpoint|g' test-email.html

echo "✅ API请求修复完成"

# 创建环境配置文件
echo "⚙️ 更新环境配置..."
cat > .env << 'EOF'
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=saber_consulting
DB_PORT=3306

# 邮箱配置
QQ_EMAIL_PASS=your-qq-email-auth-code

# 管理后台配置
ADMIN_USERNAME=Sy321098
ADMIN_PASSWORD=Sy098321

# 华为邮箱配置（可选）
HUAWEI_EMAIL_USER=your-email@your-domain.com
HUAWEI_EMAIL_PASS=your-huawei-auth-code
EOF

echo "✅ 环境配置文件已创建"

# 重启服务
echo "🔄 重启服务..."
pm2 restart saber-consulting

echo ""
echo "🎉 修复完成！"
echo "=========================="
echo "📋 修复内容："
echo "1. ✅ API请求现在使用正确的协议"
echo "2. ✅ 环境配置文件已更新"
echo "3. ✅ 服务已重启"
echo ""
echo "🌐 现在可以通过以下地址访问："
echo "   HTTP: http://120.55.113.85:3000"
echo "   管理后台: http://120.55.113.85:3000/admin"
echo ""
echo "⚠️ 重要提醒："
echo "1. 请使用HTTP协议访问，不要使用HTTPS"
echo "2. 如果仍有问题，请检查防火墙设置"
echo "3. 确保MySQL服务正在运行"
echo ""
echo "🛠️ 如果问题仍然存在，请运行："
echo "   pm2 logs saber-consulting"
echo "   查看详细错误日志"
