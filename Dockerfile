# 第一阶段：构建依赖与编译代码
FROM node:20-alpine AS builder
WORKDIR /app

# 复制依赖描述文件并安装所有依赖
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && npm ci

# 复制整个项目并执行代码生成与打包构建
COPY . .
RUN npx prisma generate
# 限制线程池大小和内存使用上限，防止低配云服务器在编译时卡死
RUN env UV_THREADPOOL_SIZE=1 NODE_OPTIONS="--max-old-space-size=1024" npm run build

# 第二阶段：生产环境运行镜像
FROM node:20-alpine AS runner
WORKDIR /app

# 安装 bash, docker-cli 和 git 客户端以及 ffmpeg，以便在容器内运行备份还原、检查更新和视频切片
RUN apk add --no-cache bash docker-cli git ffmpeg

ENV NODE_ENV=production
ENV PORT=9002

# 复制运行时所需的最简文件以缩减镜像体积
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
# 赋予脚本可执行权限
RUN chmod +x ./scripts/*.sh

EXPOSE 9002
CMD ["npm", "run", "start"]
