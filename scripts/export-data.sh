#!/bin/bash

# 配置
BACKUP_DIR="./backups"
DB_CONTAINER="heovose-db"
DB_NAME="heovose_elevate"
DB_USER="heovose"
MINIO_VOLUME="heovose-web-09_minio_data"

mkdir -p $BACKUP_DIR

echo "🚀 开始导出 Heovose Elevate 数据..."

# 1. 导出 PostgreSQL 数据库
echo "📦 正在导出数据库 (PostgreSQL)..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/db_backup.sql"

# 2. 导出 MinIO 存储数据
echo "📦 正在导出存储桶 (MinIO)..."
docker run --rm -v $MINIO_VOLUME:/data -v $(pwd)/backups:/backup alpine tar cvf /backup/minio_backup.tar -C /data .

echo "✅ 导出完成！备份文件保存在 $BACKUP_DIR 目录下："
ls -lh $BACKUP_DIR
echo "💡 请将整个项目（包括 $BACKUP_DIR）拷贝到新设备。"
