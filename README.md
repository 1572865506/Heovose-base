# Heovose Elevate 生产环境部署与运维完全指南

本仓库代码基于 **Next.js 15 (Turbopack)** 与 **Prisma ORM** 构建，配套 **PostgreSQL** 数据库及 **MinIO** 对象存储。本说明文档将为您详细梳理开发调试、生产部署、版本迭代及数据备份的一站式流程。

---

## 目录
1. [系统架构与基础端口服务](#1-系统架构与基础端口服务)
2. [本地开发与调试 (Local Development)](#2-本地开发与调试-local-development)
3. [生产环境 Docker Compose 部署步骤](#3-生产环境-docker-compose-部署步骤)
4. [生产环境版本迭代更新指南](#4-生产环境版本迭代更新指南)
5. [环境变量配置 `.env` 详解](#5-环境变量配置-env-详解)
6. [数据备份与恢复 (PostgreSQL & MinIO)](#6-数据备份与恢复-postgresql--minio)

---

## 1. 系统架构与基础端口服务

系统部署共包含三个核心组件：
* **Web 应用** (Next.js 15)：处理前台业务及后台管理，默认监听端口 `9002`。
* **数据库** (PostgreSQL 16)：存储核心业务与多语言翻译数据，默认端口 `5432`。
* **对象存储** (MinIO)：存放图片、视频、产品文档等素材，API 端口 `9000`，管理后台端口 `9001`。

> [!IMPORTANT]
> **安全组放行建议**：在云服务器控制台，建议**仅放行** `80` (HTTP)、`443` (HTTPS) 端口。
> 数据库的 `5432` 端口以及 MinIO 的 `9000` 端口应当限制在服务器本地回环（`127.0.0.1`）访问，避免暴露给公网。如有需要，可将 `9001` (MinIO 后台) 临时放行用于管理。

---

## 2. 本地开发与调试 (Local Development)

### 2.1 启动基础存储与数据库 (Docker)
在本地运行开发服务前，需首先确保本地 Docker 容器在后台运行：
```bash
# 启动本地 PostgreSQL 和 MinIO
docker-compose up -d postgres minio
```

### 2.2 安装依赖与启动服务
1. **安装本地依赖**：
   ```bash
   npm install
   ```
2. **应用数据库结构及基础种子数据**：
   ```bash
   # 同步本地表结构
   npx prisma db push
   # 注入默认管理员、多语言等种子数据
   npx prisma db seed
   ```
3. **本地启动应用**：
   ```bash
   npm run dev
   ```
   本地应用服务启动后，在浏览器访问 `http://localhost:9002`。

---

## 3. 生产环境 Docker Compose 部署步骤

当您在阿里云或其它云服务器上全新部署本应用时，请按照以下步骤操作：

### 3.1 编写生产环境 `docker-compose.yml`
建议在服务器代码存放目录（例如 `/mnt/nvme1n1/heovose`）放置或更新如下 `docker-compose.yml` 配置：

```yaml
version: '3.8'

services:
  # 1. PostgreSQL 数据库
  postgres:
    image: postgres:16-alpine
    container_name: heovose-db
    restart: always
    environment:
      POSTGRES_USER: heovose
      POSTGRES_PASSWORD: heovose_password # 请修改为您设定的高强度密码
      POSTGRES_DB: heovose_elevate
    ports:
      - "127.0.0.1:5432:5432" # 仅限本地连接，保障安全
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # 2. MinIO 对象存储
  minio:
    image: minio/minio
    container_name: heovose-storage
    restart: always
    ports:
      - "127.0.0.1:9000:9000" # API 端口仅本地连接
      - "0.0.0.0:9001:9001" # 供外网管理控制台访问
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minio_password # 请修改为您设定的高强度密码
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  # 3. Next.js Web 前端应用
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: heovose-web
    restart: always
    ports:
      - "127.0.0.1:9002:9002" # 通过 Nginx 进行反向代理
    depends_on:
      - postgres
      - minio
    env_file:
      - .env
    # 挂载宿主机 docker 管道，以便容器内运行的备份工具在宿主机上调取容器命令
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./backups:/app/backups
```

### 3.2 准备环境变量
在项目代码根目录下，创建 `.env` 文件并填入您的生产环境配置。各字段含义可参考下文的 [环境变量配置 `.env` 详解](#5-环境变量配置-env-详解)。

### 3.3 启动所有容器
```bash
# 执行打包构建 Web 镜像并启动所有容器
docker-compose up -d --build
```

### 3.4 物理数据库结构与种子配置初始化
容器初次启动后，请为生产数据库初始化表结构和系统默认的管理员、配置词条信息：
```bash
# 1. 结构同步
docker-compose exec web npx prisma db push

# 2. 灌入初始种子数据 (仅需在全新数据库时执行一次)
docker-compose exec web npx prisma db seed
```

---

## 4. 生产环境版本迭代更新指南

当您在本地开发完毕并推送了新的代码版本（例如在 `develop` 分支），您需要更新生产服务器。

> [!TIP]
> **更新三步走**：如果更新包含数据库字段的修改，以下步骤能保证数据库表结构、Prisma 客户端类型及 Next.js 静态页面打包保持一致：

1. **进入服务器项目目录并拉取最新代码**：
   ```bash
   git pull origin develop
   ```
2. **重新编译并重启 Web 应用容器**：
   ```bash
   docker-compose up -d --build web
   ```
3. **将新字段/表迁移同步到生产数据库**（无缝兼容已存在的业务数据）：
   ```bash
   docker-compose exec web npx prisma db push
   ```

---

## 5. 环境变量配置 `.env` 详解

生产服务器下的 `.env` 应按照如下模板和要求进行配置：

```env
# ==========================================
# 1. 数据库配置 (Prisma 连接串)
# ==========================================
# 宿主机或容器连接本地 PostgreSQL 连接串
DATABASE_URL="postgresql://heovose:heovose_password@postgres:5432/heovose_elevate?schema=public"

# ==========================================
# 2. NextAuth 鉴权登录配置
# ==========================================
# NEXTAUTH_URL 必须为生产环境的实际公网访问域名或公网 IP，否则登录和安全 Token 会失效
NEXTAUTH_URL="http://你的公网IP或域名"
AUTH_URL="http://你的公网IP或域名"
# 鉴权密钥，推荐生成高强度安全码：openssl rand -base64 33
AUTH_SECRET="your_high_strength_secret_key"
AUTH_TRUST_HOST=true

# ==========================================
# 3. MinIO 存储连接配置
# ==========================================
# 容器内应用通过内部网络服务名 "minio" 连接 API
STORAGE_ENDPOINT="minio"
STORAGE_PORT=9000
STORAGE_ACCESS_KEY="minioadmin"
STORAGE_SECRET_KEY="minio_password"
STORAGE_BUCKET="heovose-assets"
STORAGE_USE_SSL="false"

# ==========================================
# 4. Node.js 运行时配置
# ==========================================
NODE_ENV="production"
PORT=9002
```

---

## 6. 数据备份与恢复 (PostgreSQL & MinIO)

为了防止数据丢失，系统在 `scripts/` 下预置了数据备份和恢复脚本。所有备份出的包默认会生成在项目根目录的 `./backups` 下。

### 6.1 执行一键备份
在宿主机根目录下直接运行备份脚本，即可将当前的**数据库全量 SQL** 以及 **MinIO 中的静态文件**打包归档：
```bash
bash scripts/backup.sh
```
* 运行后会在 `backups/` 目录下生成类似 `backup_20260624_152410.tar.gz` 的物理文件。

### 6.2 执行一键恢复
如果发生故障需要还原数据，可在宿主机根目录下运行：
```bash
# 传入指定的备份压缩包文件路径进行恢复
bash scripts/restore.sh ./backups/backup_xxxxxx.tar.gz
```
* **恢复逻辑**：脚本会自动清空当前数据库中已有的表，并自动导入备份包的 SQL 以及重新填充 MinIO 存储桶中的静态文件。

---

祝部署顺利！如有其他问题或需求，请随时查阅 `docs/blueprint.md`。

<!-- TEST_COMMIT: 2026-06-27 update testing hook -->
<!-- TEST_COMMIT_2: 2026-06-27 second update testing hook -->
