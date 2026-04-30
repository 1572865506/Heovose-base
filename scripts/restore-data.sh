#!/bin/bash

# 配置
BACKUP_DIR="./backups"
DB_CONTAINER="heovose-db"
DB_NAME="heovose_elevate"
DB_USER="heovose"
MINIO_VOLUME="heovose-web-09_minio_data"

echo "🚀 开始还原 Heovose Elevate 数据..."

# 1. 还原 PostgreSQL 数据库
if [ -f "$BACKUP_DIR/db_backup.sql" ]; then
    echo "📦 正在还原数据库 (PostgreSQL)..."
    cat "$BACKUP_DIR/db_backup.sql" | docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME
else
    echo "⚠️ 警告: 未找到数据库备份文件 $BACKUP_DIR/db_backup.sql"
fi

# 2. 还原 MinIO 存储数据
if [ -f "$BACKUP_DIR/minio_backup.tar" ]; then
    echo "📦 正在还原存储桶 (MinIO)..."
    # 先清理旧数据，再解压新数据
    docker run --rm -v $MINIO_VOLUME:/data -v $(pwd)/backups:/backup alpine sh -c "rm -rf /data/* && tar xvf /backup/minio_backup.tar -C /data"
else
    echo "⚠️ 警告: 未找到存储桶备份文件 $BACKUP_DIR/minio_backup.tar"
fi

echo "✅ 还原完成！请重启项目容器以确保数据生效。"
