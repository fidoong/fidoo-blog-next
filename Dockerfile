# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 安装依赖（包括 devDependencies）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 生成数据库迁移文件
RUN pnpm db:generate

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 安装必要工具
RUN apk add --no-cache netcat-openbsd
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 复制必要文件
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/config ./config
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/drizzle ./drizzle

# 安装生产依赖 + drizzle-kit + tsx（用于迁移和种子）
RUN pnpm install --prod --frozen-lockfile && \
    pnpm add -D drizzle-kit tsx

EXPOSE 3000

# 启动脚本
CMD sh -c "echo '⏳ 等待数据库就绪...' && \
  while ! nc -z postgres 5432; do sleep 1; done && \
  echo '✅ 数据库就绪，执行迁移...' && \
  pnpm db:migrate && \
  echo '🌱 初始化数据...' && \
  pnpm db:seed && \
  echo '🚀 启动应用...' && \
  pnpm start"
