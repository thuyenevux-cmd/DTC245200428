#!/usr/bin/env bash
# Sinh file .env với mật khẩu ngẫu nhiên mạnh cho toàn bộ dịch vụ.
# Chạy trong máy chủ Docker (Ubuntu) hoặc Git Bash trên Windows:
#   bash scripts/gen-secrets.sh
# File .env KHÔNG được commit — chỉ commit .env.example.
set -euo pipefail

ENV_FILE="${1:-.env}"

if [ -f "$ENV_FILE" ]; then
  echo "[secrets] $ENV_FILE đã tồn tại — giữ nguyên. Xoá file nếu muốn sinh lại."
  exit 0
fi

gen() {
  openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | cut -c1-28
}

MYSQL_ROOT_PASSWORD="$(gen)"
MYSQL_PASSWORD="$(gen)"
MYSQL_EXPORTER_PASSWORD="$(gen)"
SESSION_SECRET="$(gen)"
GRAFANA_ADMIN_PASSWORD="$(gen)"
MONITORING_PASSWORD="$(gen)"

cat > "$ENV_FILE" <<EOF
# ============================================================================
#  Cấu hình môi trường — SINH TỰ ĐỘNG, KHÔNG COMMIT
#  Sinh lại: bash scripts/gen-secrets.sh
# ============================================================================

# --- Ứng dụng ---
NODE_ENV=production
APP_NAME=Quản lý kho hàng
SESSION_SECRET=${SESSION_SECRET}
COOKIE_SECURE=false
SERVER_NAME=kho-hang.local
# Địa chỉ IP của máy chủ để đưa vào SAN của chứng thư TLS tự ký.
# Lấy bằng: hostname -I | awk '{print $1}'
SERVER_IP=${SERVER_IP:-127.0.0.1}

# --- MySQL ---
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=kho_hang
MYSQL_USER=kho_app
MYSQL_PASSWORD=${MYSQL_PASSWORD}
MYSQL_EXPORTER_PASSWORD=${MYSQL_EXPORTER_PASSWORD}

# --- Grafana ---
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}

# --- Tài khoản xem công cụ giám sát qua Nginx (basic auth) ---
MONITORING_USER=monitoring
MONITORING_PASSWORD=${MONITORING_PASSWORD}
EOF

chmod 600 "$ENV_FILE"
echo "[secrets] Đã sinh $ENV_FILE với mật khẩu ngẫu nhiên."

# mysqld_exporter chỉ đọc thông tin đăng nhập MySQL từ file .my.cnf
MYCNF_DIR="$(cd "$(dirname "$0")/.." && pwd)/docker/mysql-exporter"
mkdir -p "$MYCNF_DIR"
cat > "$MYCNF_DIR/my.cnf" <<EOF
[client]
user=exporter
password=${MYSQL_EXPORTER_PASSWORD}
host=mysql
port=3306
EOF
# Container exporter chạy bằng user "nobody" nên file phải đọc được được.
# Trên máy dùng chung, nên dùng: sudo chown 65534:65534 my.cnf && chmod 600
chmod 644 "$MYCNF_DIR/my.cnf"
echo "[secrets] Đã sinh $MYCNF_DIR/my.cnf cho mysqld_exporter (không commit file này)."

# phpMyAdmin cần ghi config.secret.inc.php (blowfish secret) nhưng container chạy
# với read-only rootfs — sinh sẵn file để mount vào, giữ nguyên hardening.
PMA_DIR="$(cd "$(dirname "$0")/.." && pwd)/docker/phpmyadmin"
mkdir -p "$PMA_DIR"
BLOWFISH="$(openssl rand -hex 16)"
cat > "$PMA_DIR/config.secret.inc.php" <<EOF
<?php
// Sinh tự động bởi scripts/gen-secrets.sh — KHÔNG commit
\$cfg['blowfish_secret'] = '${BLOWFISH}';
\$cfg['AllowArbitraryServer'] = false;
\$cfg['CaptchaMethod'] = 'invisible';
EOF
chmod 644 "$PMA_DIR/config.secret.inc.php"
echo "[secrets] Đã sinh $PMA_DIR/config.secret.inc.php (không commit file này)."
