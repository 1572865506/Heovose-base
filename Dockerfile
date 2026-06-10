# 第一阶段：构建依赖与编译代码
FROM node:20-alpine AS builder
WORKDIR /app

# 复制依赖描述文件并安装所有依赖
COPY package*.json ./
RUN npm ci

# 复制整个项目并执行代码生成与打包构建
COPY . .
RUN npx prisma generate
RUN npm run build

# 第二阶段：生产环境运行镜像
FROM node:20-alpine AS runner
WORKDIR /app

# 安装 bash 和 docker-cli 客户端，以便在容器内运行备份还原脚本
RUN apk add --no-cache bash docker-cli

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
