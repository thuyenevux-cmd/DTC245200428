#!/bin/sh
# Sinh chứng TLS tự ký và file htpasswd nếu chưa có, rồi chạy nginx.
set -e

CERT_DIR=/etc/nginx/certs
HTPASSWD_FILE=/etc/nginx/certs/htpasswd

mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_DIR/fullchain.pem" ]; then
  echo "[entrypoint] Sinh chứng thư TLS tự ký cho ${SERVER_NAME:-localhost}"
  SAN="DNS:${SERVER_NAME:-localhost},DNS:localhost,IP:127.0.0.1"
  if [ -n "${SERVER_IP:-}" ]; then
    SAN="$SAN,IP:${SERVER_IP}"
  fi
  openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
    -keyout "$CERT_DIR/privkey.pem" \
    -out "$CERT_DIR/fullchain.pem" \
    -subj "/C=VN/ST=HCM/L=HCM/O=Kho Hang/OU=TKQT HTPM/CN=${SERVER_NAME:-localhost}" \
    -addext "subjectAltName=${SAN}" \
    2>/dev/null
  chmod 600 "$CERT_DIR/privkey.pem"
  chmod 644 "$CERT_DIR/fullchain.pem"
  echo "[entrypoint] SAN: ${SAN}"
fi

if [ -f "$HTPASSWD_FILE" ]; then
  # Đảm bảo worker nginx luôn đọc được file (kể cả khi file đã tồn tại từ lần trước)
  chown root:nginx "$HTPASSWD_FILE" 2>/dev/null || true
  chmod 640 "$HTPASSWD_FILE"
elif [ -n "${MONITORING_USER:-}" ] && [ -n "${MONITORING_PASSWORD:-}" ]; then
  echo "[entrypoint] Sinh file htpasswd cho tài khoản giám sát"
  # openssl passwd -apr1 tạo hash mà nginx hiểu được
  HASH=$(openssl passwd -apr1 "$MONITORING_PASSWORD")
  printf '%s:%s\n' "$MONITORING_USER" "$HASH" > "$HTPASSWD_FILE"
  # Worker nginx chạy bằng user "nginx" (uid 101) nên file phải thuộc nhóm nginx
  chown root:nginx "$HTPASSWD_FILE" 2>/dev/null || chown root:root "$HTPASSWD_FILE"
  chmod 640 "$HTPASSWD_FILE"
fi

exec "$@"
