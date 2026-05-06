#!/bin/bash

# 配置
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="heovose-db"
DB_NAME="heovose_elevate"
DB_USER="heovose"
MINIO_VOLUME="heovose-base_minio_data"

mkdir -p $BACKUP_DIR

echo "🚀 开始导出 Heovose Elevate 数据..."

# 1. 导出 PostgreSQL 数据库
echo "📦 正在导出数据库 (PostgreSQL)..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
cp "$BACKUP_DIR/db_backup_$TIMESTAMP.sql" "$BACKUP_DIR/db_backup.sql"

# 2. 导出 MinIO 存储数据
echo "📦 正在导出存储桶 (MinIO)..."
docker run --rm -v $MINIO_VOLUME:/data -v $(pwd)/backups:/backup alpine tar cvf /backup/minio_backup_$TIMESTAMP.tar -C /data .
cp "$BACKUP_DIR/minio_backup_$TIMESTAMP.tar" "$BACKUP_DIR/minio_backup.tar"

# 3. 备份环境变量
if [ -f ".env" ]; then
    echo "📦 正在备份环境变量 (.env)..."
    cp .env "$BACKUP_DIR/.env.backup_$TIMESTAMP"
fi

echo "✅ 导出完成！最新备份已链接到 $BACKUP_DIR 目录下的标准文件名。"
ls -lh $BACKUP_DIR | grep "$TIMESTAMP"
echo "💡 请妥善保管 $BACKUP_DIR 目录及 .env 文件。"
