#!/bin/bash

# 获取当前项目文件夹名称（清理非字母数字字符）
PROJECT_NAME=$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

echo "🚀 开始导出 Heovose Elevate 数据..."

# 1. 导出 PostgreSQL 数据库
echo "📦 正在导出数据库 (PostgreSQL)..."
docker exec heovose-db pg_dump -U heovose heovose_elevate > "$BACKUP_DIR/db_backup.sql"

# 2. 导出 MinIO 存储数据
echo "📦 正在导出存储桶 (MinIO)..."
# 自动检测 volume 名称
VOLUME_NAME=$(docker volume ls -q | grep "minio_data" | head -n 1)

if [ -z "$VOLUME_NAME" ]; then
    echo "❌ 错误: 未找到 MinIO Volume"
else
    docker run --rm -v "$VOLUME_NAME":/from alpine tar -cvf - -C /from . > "$BACKUP_DIR/minio_backup.tar"
fi

echo "✅ 导出完成！备份文件保存在 $BACKUP_DIR 目录下："
ls -lh $BACKUP_DIR
echo "💡 请将整个项目（包括 $BACKUP_DIR）拷贝到新设备。"
