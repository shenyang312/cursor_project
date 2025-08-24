#!/bin/bash
# 一键 MySQL 准备脚本（阿里云 CentOS）
# 用法（支持自定义变量）：
# RESET_CLEAN=1 MYSQL_ROOT_PASSWORD='Root@123456!' MYSQL_DB='saber_consulting' MYSQL_REMOTE_USER='saber_user' MYSQL_REMOTE_PASS='saber_password' sudo bash deploy/install_mysql_centos.sh

set -euo pipefail                               # 遇错退出，未定义变量报错，管道出错冒泡

SUDO=""                                         # 预设 sudo 命令为空
[[ $EUID -ne 0 ]] && SUDO="sudo"                # 不是 root 则使用 sudo

PUBLIC_IP="120.55.113.85"                       # 你的公网 IP（用于本地 .env 输出）
DB_NAME="${MYSQL_DB:-saber_consulting}"         # 目标数据库名（可用环境变量覆盖）
ROOT_PWD="${MYSQL_ROOT_PASSWORD:-Root@123456!}" # root 密码（可用环境变量覆盖）
REMOTE_USER="${MYSQL_REMOTE_USER:-saber_user}"  # 远程用户（可用环境变量覆盖）
REMOTE_PASS="${MYSQL_REMOTE_PASS:-saber_password}" # 远程用户密码（可用环境变量覆盖，建议改强）
RESET="${RESET_CLEAN:-0}"                       # 是否清理旧安装（1 表示清理）

# 简单安装/卸载封装（兼容 yum/dnf）
pkg_install() { $SUDO yum install -y "$@" || $SUDO dnf install -y "$@" || true; }  # 安装软件包
pkg_remove()  { $SUDO yum remove  -y "$@" || $SUDO dnf remove  -y "$@" || true; }  # 卸载软件包

if [[ "$RESET" == "1" ]]; then                                   # 如需清理旧安装
  $SUDO systemctl stop mysqld 2>/dev/null || true                # 停 mysqld（若在）
  $SUDO systemctl stop mariadb 2>/dev/null || true               # 停 mariadb（若在）
  pkg_remove 'mysql*' 'mariadb*'                                 # 卸载 MySQL/MariaDB 包
  $SUDO rm -rf /var/lib/mysql /etc/my.cnf /etc/mysql /etc/my.cnf.d /var/log/mysqld.log 2>/dev/null || true  # 清理数据/配置
fi                                                                # 结束清理

pkg_install wget curl lsof                                        # 装常用工具
SERVICE="mysqld"                                                  # 默认服务名
if ! command -v mysql >/dev/null 2>&1; then                       # 如无 mysql 客户端，说明未安装
  pkg_install mysql-server || pkg_install mysql-community-server || pkg_install mariadb-server  # 安装 MySQL 或 MariaDB
fi                                                                # 结束安装
systemctl list-unit-files | grep -q mariadb.service && SERVICE="mariadb"  # 若存在 mariadb 服务，切换服务名
$SUDO systemctl enable --now "$SERVICE"                           # 启用并启动数据库服务

# 尝试用 root 密码连一次
if ! mysql -uroot -p"${ROOT_PWD}" -e "SELECT 1;" >/dev/null 2>&1; then  # 如登录失败
  TEMP_PWD=""                                                           # 预设临时密码为空
  [[ -f /var/log/mysqld.log ]] && TEMP_PWD=$(grep 'temporary password' /var/log/mysqld.log | tail -1 | awk '{print $NF}') || true  # 试读 MySQL8 临时密码
  if [[ -n "$TEMP_PWD" ]]; then                                         # 找到临时密码
    mysql --connect-expired-password -uroot -p"$TEMP_PWD" -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '${ROOT_PWD}';" || true  # 用临时密码更新 root
  else                                                                  # 否则走跳过权限表方式
    $SUDO mkdir -p /etc/my.cnf.d                                        # 确保目录存在
    $SUDO bash -c 'cat > /etc/my.cnf.d/reset-root.cnf <<EOF
[mysqld]
skip-grant-tables
skip-networking
EOF'                                                                    # 写入临时配置
    $SUDO systemctl restart "$SERVICE"; sleep 3                         # 重启让临时配置生效
    mysql -uroot -e "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED BY '${ROOT_PWD}';" || true  # 无密码重置 root
    $SUDO rm -f /etc/my.cnf.d/reset-root.cnf                            # 移除临时配置
    $SUDO systemctl restart "$SERVICE"; sleep 3                         # 重启恢复正常
  fi                                                                    # 结束两种重置方式
fi                                                                      # 结束 root 测试

MYCNF_FILES=(/etc/my.cnf /etc/mysql/my.cnf /etc/my.cnf.d/server.cnf)    # 可能存在的配置路径
FOUND=0                                                                 # 标记是否找到配置
for f in "${MYCNF_FILES[@]}"; do                                        # 遍历路径
  if [[ -f "$f" ]]; then                                                # 找到配置文件
    FOUND=1                                                             # 标记已找到
    if grep -q '^\[mysqld\]' "$f"; then                                 # 已有 [mysqld] 段
      $SUDO sed -i 's/^bind-address.*/bind-address = 0.0.0.0/g' "$f" || true   # 改为 0.0.0.0
      $SUDO sed -i 's/^skip-networking.*/# skip-networking/g' "$f" || true     # 注释 skip-networking
      grep -q '^bind-address' "$f" || $SUDO bash -c "printf '\n[mysqld]\nbind-address = 0.0.0.0\n' >> $f"  # 若无则追加
    else                                                                 # 没有 [mysqld] 段
      $SUDO bash -c "printf '\n[mysqld]\nbind-address = 0.0.0.0\n' >> $f"       # 直接追加
    fi                                                                    # 结束分支
  fi                                                                      # 结束存在判断
done                                                                      # 结束遍历
[[ $FOUND -eq 0 ]] && echo "未找到 my.cnf，使用默认配置继续"               # 未找到配置也继续
$SUDO systemctl restart "$SERVICE"                                       # 重启服务让配置生效

SQL_FILE="deploy/mysql-remote-init.sql"                                  # 初始化 SQL
if [[ -f "$SQL_FILE" ]]; then                                            # 如脚本存在
  echo "导入初始化脚本：$SQL_FILE"                                       # 打印提示
  mysql -uroot -p"${ROOT_PWD}" < "$SQL_FILE"                             # 导入表结构与示例数据
else                                                                      # 否则
  echo "未找到 $SQL_FILE，跳过导入（可稍后手动执行）。"                  # 打印提示
fi                                                                        # 结束导入

mysql -uroot -p"${ROOT_PWD}" -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"  # 创建库（幂等）
mysql -uroot -p"${ROOT_PWD}" -e "CREATE USER IF NOT EXISTS '${REMOTE_USER}'@'%' IDENTIFIED BY '${REMOTE_PASS}'; GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${REMOTE_USER}'@'%'; FLUSH PRIVILEGES;"  # 创建远程用户并授权

if command -v firewall-cmd >/dev/null 2>&1; then                          # 如存在 firewalld
  $SUDO firewall-cmd --permanent --add-port=3306/tcp || true              # 永久放行 3306
  $SUDO firewall-cmd --reload || true                                      # 重新加载规则
else                                                                       # 否则
  echo "未检测到 firewalld，请在安全组放行 3306 或手动配置防火墙。"       # 提示手动处理
fi                                                                         # 结束放行

echo "----- 自检: 监听端口 -----"                                         # 自检标题
(ss -lntp 2>/dev/null || netstat -lntp 2>/dev/null) | grep 3306 || true   # 查看 3306 监听
echo "----- 自检: MySQL 变量 -----"                                       # 自检标题
mysql -uroot -p"${ROOT_PWD}" -e "SHOW VARIABLES LIKE 'bind_address'; SHOW VARIABLES LIKE 'skip_networking';" || true  # 查看关键变量

echo                                                                       # 空行
echo "完成。若本地仍无法连通，请检查：1) 阿里云安全组入方向放行 3306；2) 服务器是否绑定公网IP；3) 本地网络是否拦截。"  # 提醒
echo                                                                       # 空行
echo "连接信息（用于本地 .env）:"                                          # 输出连接信息
echo "DB_HOST=${PUBLIC_IP}"                                                # 主机
echo "DB_PORT=3306"                                                        # 端口
echo "DB_USER=${REMOTE_USER}"                                              # 用户
echo "DB_PASSWORD=${REMOTE_PASS}"                                          # 密码
echo "DB_NAME=${DB_NAME}"                                                  # 数据库
echo "NODE_ENV=development"                                                # 环境
echo                                                                       # 空行
echo "本地测试命令：mysql -h ${PUBLIC_IP} -P 3306 -u ${REMOTE_USER} -p${REMOTE_PASS} -e 'SHOW DATABASES;'"  # 提供测试命令