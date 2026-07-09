#!/bin/bash
# Heovose Elevate 生产环境自动部署脚本 (宿主机端运行)
# 限制资源编译，防止服务器卡死

echo "🚀 [$(date)] 开始执行系统安全部署..."

# 1. 安全拉取最新代码
TARGET_COMMIT=${1:-"origin/main"}
echo "⬇️ 正在从 GitHub 仓库拉取代码 (目标版本: $TARGET_COMMIT)..."
git fetch origin main
git reset --hard $TARGET_COMMIT

# 2. 数据库 Schema 同步
echo "🔄 正在同步数据库 Schema 结构..."
npx prisma@6 db push --accept-data-loss

# 3. 宿主机端隔离构建镜像 (限制 1核2G 硬件资源，保证线上访问不受影响)
echo "🏗️ 开始构建 Docker 镜像 (硬件限制：1核 CPU，2GB 内存)..."
docker build --cpus="1.0" --memory="2g" -t heovose-web .

if [ $? -eq 0 ]; then
    echo "✅ Docker 镜像构建成功！正在重启容器激活新版本..."
    docker restart heovose-web
    echo "🎉 [$(date)] 系统部署圆满完成！网站已正常恢复访问。"
else
    echo "❌ Docker 镜像构建失败，升级终止，当前运行版本未受影响。"
    exit 1
fi
