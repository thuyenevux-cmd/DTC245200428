# ============================================================================
#  Nginx — reverse proxy + TLS tự ký + security headers
#  Image tu chỉnh để sinh chứng thư và file htpasswd ngay khi khởi động,
#  không cần lưu khoá riêng tư vào Git.
# ============================================================================
FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8080 8443

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
