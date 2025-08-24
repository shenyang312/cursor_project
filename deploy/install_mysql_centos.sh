#!/bin/bash

# MySQL安装脚本 - CentOS/RHEL
echo "🗄️ 安装MySQL..."

# 安装MySQL
yum install -y mysql-server mysql

# 启动MySQL服务
systemctl start mysqld
systemctl enable mysqld

# 获取MySQL临时密码
temp_password=$(grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')

echo "✅ MySQL安装完成"
echo "📝 MySQL临时密码: $temp_password"
echo "⚠️ 请运行以下命令设置新密码："
echo "   mysql_secure_installation"