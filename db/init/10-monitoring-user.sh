#!/bin/bash
# Tạo tài khoản chỉ đọc cho mysqld_exporter (nằm trong /docker-entrypoint-initdb.d).
# Mật khẩu lấy từ biến môi trường, không ghi thẳng vào mã nguồn.
set -e

if [ -z "${MYSQL_EXPORTER_PASSWORD:-}" ]; then
  echo "[init] Bỏ qua: chưa đặt MYSQL_EXPORTER_PASSWORD"
  exit 0
fi

echo "[init] Tạo tài khoản giám sát 'exporter' cho mysqld_exporter"
mysql --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" <<SQL
CREATE USER IF NOT EXISTS 'exporter'@'%' IDENTIFIED BY '${MYSQL_EXPORTER_PASSWORD}';
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'%';
FLUSH PRIVILEGES;
SQL
echo "[init] Hoàn tất tài khoản giám sát"
