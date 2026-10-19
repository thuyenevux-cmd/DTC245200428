# Hệ thống Quản lý Kho hàng (Inventory)

Ứng dụng web quản lý kho hàng: **nhập hàng, xuất hàng, tồn kho, nhà cung cấp** — triển khai hoàn toàn bằng **Docker Compose** kèm **Nginx reverse proxy + TLS**, **Prometheus + Grafana**, **Loki + Promtail** và các biện pháp **hardening**.

| | |
|---|---|
| **Sinh viên** | Vũ Ngọc Anh Thuyên |
| **Mã sinh viên** | DTC245200428 |
| **Lớp** | K23C · CNTT |
| **Môn** | Triển khai và Quản trị Hệ thống Phần mềm |
| **Đề tài** | Đề 5 — Hệ thống Quản lý Kho hàng (Inventory) |
| **Công nghệ** | Node.js 22 · Express · EJS · MySQL 8 · Nginx · Prometheus · Grafana · Loki · Promtail |

---

## 1. Chạy hệ thống

### 1.1 Yêu cầu

- Docker Engine ≥ 25 + Docker Compose v2 (`docker compose version`)
- Máy chủ có Docker: Ubuntu 24.04+/Debian 12+ hoặc Docker Desktop
- Cổng **8080** (HTTP) và **8443** (HTTPS) chưa bị chiếm

### 1.2 Chạy

```bash
git clone https://github.com/thuyenevux-cmd/DTC245200428.git
cd DTC245200428

# 1. Sinh .env với mật khẩu ngẫu nhiên (KHÔNG commit file này)
bash scripts/gen-secrets.sh

# 2. Sửa SERVER_IP trong .env cho đúng địa chỉ máy chủ
#    (dùng cho SAN của chứng thư TLS tự ký)
sed -i "s/^SERVER_IP=.*/SERVER_IP=$(hostname -I | awk '{print $1}')/" .env

# 3. Dựng và chạy toàn bộ hệ thống
docker compose up -d --build

# 4. Xem trạng thái
docker compose ps
```

Truy cập:

| Địa chỉ | Mục đích | Cách đăng nhập |
|---|---|---|
| `https://<IP>:8443/` | Ứng dụng quản lý kho | `admin` / `Kho@2026` (tài khoản mẫu trong DB) |
| `https://<IP>:8443/phpmyadmin/` | Quản lý cơ sở dữ liệu | `kho_app` + mật khẩu MySQL trong `.env` |
| `https://<IP>:8443/grafana/` | Dashboard giám sát | tài khoản `monitoring` + mật khẩu trong `.env` (basic auth của Nginx, Grafana tự đăng nhập qua auth proxy) |
| `https://<IP>:8443/prometheus/` | Prometheus (targets, graph) | basic auth `monitoring` |
| `https://<IP>:8443/loki/api/v1/query` | API truy vấn LogQL | basic auth `monitoring` |

> Cổng HTTP `8080` tự chuyển hướng (301) sang HTTPS `8443`.
> Chứng thư TLS tự ký được sinh lúc khởi động container Nginx — trình duyệt sẽ báo
> "không riêng tư". Cài chứng thư vào máy để không bị cảnh báo:
> ```bash
> docker compose cp nginx:/etc/nginx/certs/fullchain.pem ./kho-hang.crt
> # Windows: Import-Certificate -FilePath .\kho-hang.crt -CertStoreLocation Cert:\CurrentUser\Root
> ```

### 1.3 Chạy ở chế độ phát triển (không dùng Docker)

```bash
npm install
cp .env.example .env      # sửa DB_HOST/DB_PORT trỏ tới MySQL
npm run db:migrate        # tạo bảng
npm run db:seed           # nạp dữ liệu mẫu (28 mã hàng, 65 phiếu, 135 dòng sổ kho)
npm run dev               # http://localhost:3000
```

---

## 2. Kiến trúc hệ thống

```
                    ┌──────────────────────── Internet / LAN ────────────────────────┐
                    │        http://8080  →  301  →  https://8443 (TLS tự ký)        │
                    └───────────────────────────────────┬───────────────────────────┘
                                                        │
                                              ┌─────────▼─────────┐
                                              │  Nginx (reverse   │  security headers, TLS,
                                              │  proxy) :8080/8443│  basic auth, stub_status
                                              └────┬──────┬───────┘
                     ┌─────────────────────────────┘      └──────────────────────┐
                     │                                                            │
             ┌───────▼────────┐                                          ┌────────▼────────┐
             │  app (Node.js) │  :3000  ── /metrics (Prometheus)         │  phpMyAdmin     │
             │  user 1000     │                                          │  (nguồn DB)     │
             └───────┬────────┘                                          └────────┬────────┘
                     │                                                            │
        ┌────────────┴──────────┐            ┌──────────────────┐              │
        │  kho-net (bridge)      │            │  kho-db (internal)│   ← không có NAT
        │  nginx ↔ app ↔ grafana │            │  mysql ↔ app ↔    │      ra ngoài
        │  ↔ prometheus ↔ loki  │            │  phpmyadmin ↔     │
        │  ↔ promtail ↔ exporter│            │  mysql-exporter   │
        └───────────────────────┘            └──────────────────┘
                     │
        ┌────────────┴─────────────────────────────────────────────┐
        │  Prometheus (9090) · Grafana (3000) · Loki (3100)         │
        │  Promtail (9080) · node-exporter (9100) · mysqld-exporter │
        └──────────────────────────────────────────────────────────┘
```

**11 container**, trong đó **chỉ Nginx công khai ra ngoài**. MySQL, phpMyAdmin, Prometheus, Grafana, Loki, Promtail và các exporter chỉ nghe trong mạng nội bộ; mạng `kho-db` còn được đặt `internal: true` nên container ở đó **không có NAT ra Internet**.

### Thành phần

| Service | Image | Vai trò |
|---|---|---|
| `app` | `quan-ly-kho-hang/app:1.0.0` (node:22-alpine) | Ứng dụng Express + EJS, chạy user `node` (uid 1000) |
| `nginx` | `quan-ly-kho-hang/nginx:1.0.0` (nginx:1.27-alpine) | Reverse proxy, TLS, security headers, basic auth |
| `mysql` | `mysql:8.0` | Cơ sở dữ liệu (mạng `kho-db`, không publish port) |
| `phpmyadmin` | `phpmyadmin:5.2.3-apache` | Công cụ quản lý DB |
| `prometheus` | `prom/prometheus:v3.15.0` | Thu thập chỉ số (scrape 15s) |
| `grafana` | `grafana/grafana:13.2.3` | Dashboard + Explore (provisioning sẵn) |
| `loki` | `grafana/loki:3.6.18` | Lưu log tập trung |
| `promtail` | `grafana/promtail:3.6.11` | Gom log container qua Docker socket |
| `nginx-exporter` | `nginx/nginx-prometheus-exporter:1.5.3` | Chỉ số Nginx |
| `mysql-exporter` | `prom/mysqld-exporter:v0.17.2` | 792 chỉ số MySQL |
| `node-exporter` | `prom/node-exporter:v1.9.1` | Chỉ số máy chủ |

---

## 3. Chức năng ứng dụng

| Nhóm | Trang | Mô tả |
|---|---|---|
| Tổng quan | `/` | 4 KPI (mã hàng, giá trị tồn, cần nhập gấp, số phiếu 30 ngày), biểu đồ nhập–xuất 30 ngày, cơ cấu giá trị tồn theo nhóm, bảng **Cần nhập gấp** kèm số lượng đề xuất, phiếu gần đây, top mã hàng theo giá trị tồn |
| Vận hành | `/stock/in` | Tạo **phiếu nhập**: chọn nhà cung cấp, nhiều dòng hàng, tự tính thành tiền |
| | `/stock/out` | Tạo **phiếu xuất**: chặn xuất vượt tồn, cảnh báo ngay tại dòng |
| Danh mục | `/stock` | Tồn kho theo mã hàng, lọc *Còn hàng / Sắp hết / Hết hàng*, phân trang |
| | `/products` | CRUD mã hàng: SKU, nhóm, đơn vị, giá vốn/bán, ngưỡng nhập lại |
| | `/suppliers` | CRUD nhà cung cấp: mã, tên, liên hệ, địa chỉ |
| | `/movements` | Sổ kho: lọc theo mã hàng, loại phiếu, khoảng thời gian |

**Nguyên tắc nghiệp vụ**: mọi thay đổi số lượng đều tạo **phiếu** (`NH-2026-0001`, `XH-2026-0001`, `ADJ-2026-0001`) và **dòng sổ kho** tương ứng, cập nhật tồn trong **cùng một transaction** — không bao giờ có tồn khớp mà thiếu dấu vết.

---

## 4. Giám sát

### 4.1 Prometheus

Scrape 4 mục tiêu, tất cả đều `up`:

| Job | Địa chỉ | Nội dung |
|---|---|---|
| `kho-app` | `app:3000/metrics` | Số yêu cầu theo method/route/status, số truy vấn DB, thời gian chạy |
| `nginx` | `nginx-exporter:9113` | Số kết nối, số request theo mã trạng thái |
| `mysql` | `mysql-exporter:9104` | 792 chỉ số MySQL (kết nối, truy vấn, InnoDB) |
| `node` | `node-exporter:9100` | CPU, RAM, ổ đĩa máy chủ |

Có sẵn luật cảnh báo trong `docker/prometheus/rules.yml`: ứng dụng không phản hồi, MySQL exporter không phản hồi, ổ đĩa dưới 15%, RAM dưới 10%.

### 4.2 Grafana

Dashboard `Tổng quan hệ thống Quản lý Kho hàng` (8 panel) được **provisioning sẵn**, datasource Prometheus và Loki khai báo bằng file.

### 4.3 Loki + LogQL

Promtail gom log của các container `kho-*` qua Docker socket và đẩy sang Loki. Truy vấn mẫu (chạy thật, kết quả trong báo cáo):

```bash
AUTH="monitoring:<MONITORING_PASSWORD trong .env>"

# 1. Số log theo container trong 15 phút
curl -sk -u "$AUTH" --data-urlencode 'query=sum by (container_name) (count_over_time({container_name=~"kho-.*"}[15m]))' \
  https://<IP>:8443/loki/api/v1/query

# 2. Số lần ứng dụng khởi động
curl -sk -u "$AUTH" --data-urlencode 'query=count_over_time({container_name="kho-app"} |= "production" [1h])' \
  https://<IP>:8443/loki/api/v1/query

# 3. Số dòng log chứa lỗi trong toàn hệ thống
curl -sk -u "$AUTH" --data-urlencode 'query=sum(count_over_time({container_name=~"kho-.*"} |~ "(?i)error|exception" [15m]))' \
  https://<IP>:8443/loki/api/v1/query

# 4. Phân bố mã trạng thái HTTP của Nginx
curl -sk -u "$AUTH" --data-urlencode 'query=topk(5, sum by (status) (count_over_time({container_name="kho-nginx"} | regexp "HTTP/1.1\" (?P<status>[0-9]{3})" [15m])))' \
  https://<IP>:8443/loki/api/v1/query

# 5. Top đường dẫn được truy cập
curl -sk -u "$AUTH" --data-urlencode 'query=topk(5, sum by (path) (count_over_time({container_name="kho-nginx"} | regexp "\"GET (?P<path>[^ ?\"]+)" [15m])))' \
  https://<IP>:8443/loki/api/v1/query
```

---

## 5. Hardening

| Biện pháp | Cài đặt cụ thể |
|---|---|
| Container không chạy bằng root | `app` dùng user `node` (uid 1000); `prometheus`, `grafana`, `loki` chạy user không phải root; Nginx chỉ dùng 4 capability tối thiểu |
| `cap_drop: ALL` | Áp cho toàn bộ service (Nginx thêm đúng `CHOWN`, `SETUID`, `SETGID`, `DAC_OVERRIDE`) |
| `no-new-privileges` | Bật cho mọi container |
| Read-only rootfs | `app`, `nginx`, `prometheus`, `loki`, `promtail`, `phpmyadmin` chạy với `read_only: true` + `tmpfs` cho `/tmp` |
| Tách mạng | `kho-db` có `internal: true` (không NAT), `kho-net` là bridge thường |
| Không publish cổng DB | Chỉ Nginx publish `8080`/`8443`; MySQL, phpMyAdmin, Prometheus, Grafana, Loki không có `ports` |
| Mật khẩu mạnh | `scripts/gen-secrets.sh` sinh mật khẩu ngẫu nhiên 28 ký tự cho MySQL, Grafana, session, tài khoản giám sát; `.env` **không** commit |
| Phân quyền DB | Ứng dụng dùng user `kho_app` chỉ có quyền trên database `kho_hang`; user `exporter` chỉ `PROCESS, REPLICATION CLIENT, SELECT`; `skip-name-resolve` |
| Xác thực hai lớp | Nginx basic auth (file `htpasswd` sinh lúc khởi động, quyền `640 root:nginx`) + đăng nhập riêng của ứng dụng/Grafana/phpMyAdmin |
| TLS | Chứng thư tự ký RSA-2048, TLS 1.2/1.3, `ssl_session_cache`, HSTS |
| Security headers | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`, `Strict-Transport-Security`, `server_tokens off` |
| Giới hạn tài nguyên | `deploy.resources.limits` cho memory và CPU mọi service |
| Healthcheck | App, MySQL có healthcheck; Nginx phụ thuộc `app` healthy |
| Log rotation | `json-file` driver với `max-size=10m`, `max-file=3` |

---

## 6. Cấu trúc mã nguồn

```
.
├── docker-compose.yml          # 11 service, hardening, 2 mạng, 6 volume
├── Dockerfile?  → docker/Dockerfile
├── db/
│   ├── schema.sql              # 7 bảng: users, categories, suppliers, products, stocks, stock_documents, stock_movements
│   ├── init/10-monitoring-user.sh
├── docker/
│   ├── Dockerfile              # build nhiều tầng, user node, chown + chmod
│   ├── nginx/                  # nginx.conf, conf.d/kho.conf, entrypoint.sh (sinh TLS + htpasswd)
│   ├── prometheus/             # prometheus.yml, rules.yml
│   ├── grafana/                # provisioning/datasources, provisioning/dashboards, dashboards/kho-overview.json
│   ├── loki/loki-config.yml
│   └── promtail/promtail-config.yml
├── scripts/
│   ├── gen-secrets.sh          # sinh .env + my.cnf + config.secret.inc.php
│   ├── migrate.js  seed.js  ensure-db.js  vendor-assets.js
├── src/
│   ├── server.js  app.js
│   ├── config/     env.js  db.js
│   ├── middleware/ auth.js  flash.js  metrics.js  errors.js
│   ├── repositories/ catalog.js  stock.js
│   ├── services/   documents.js   # transaction ghi phiếu + cập nhật tồn
│   ├── utils/      format.js
│   └── views/      partials/  pages/
├── public/
│   ├── css/  tokens.css  base.css  components.css
│   ├── js/   app.js
│   ├── vendor/     font Be Vietnam Pro, Chart.js, giấy phép
│   └── favicon.svg
└── docs/
    ├── design-system.md  brand-voice.md  research.md  quality-checklist.md
    ├── bao-cao.md
    └── screenshots/
```

## 7. Tài nguyên tĩnh và giấy phép

| Thành phần | Giấy phép | Ghi chú |
|---|---|---|
| Be Vietnam Pro | SIL OFL 1.1 | Tự host, subset `vietnamese` + `latin`, 4 weight |
| Lucide (icon) | ISC | Icon nội tuyến vẽ bằng `currentColor` |
| Chart.js | MIT | Biểu đồ dashboard, tự host |
| Ảnh minh hoạ | — | Ứng dụng **không dùng ảnh minh hoạ**; mọi số liệu đến từ dữ liệu thật |

## 8. Ghi chú vận hành

```bash
docker compose ps                 # trạng thái
docker compose logs -f app        # log ứng dụng
docker compose restart app        # khởi động lại ứng dụng
docker compose down               # dừng toàn bộ (giữ dữ liệu)
docker compose down -v            # dừng và xoá volume
```
