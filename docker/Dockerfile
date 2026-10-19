# ============================================================================
#  Ứng dụng Quản lý Kho hàng — image chạy production
#  - Build nhiều tầng, chỉ giữ lại dependency cần thiết
#  - Chạy bằng user không phải root (node:uid 1000)
#  - Hệ thống file gốc được đặt read-only khi chạy compose
# ============================================================================

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY src ./src
COPY db ./db
COPY scripts ./scripts
COPY public ./public

# Copy tài nguyên tĩnh (font, chart.js) từ node_modules vào public/vendor
RUN node scripts/vendor-assets.js \
    && chown -R node:node /app \
    && chmod -R a-w /app/node_modules

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
