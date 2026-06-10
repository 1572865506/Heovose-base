#!/bin/sh

# 配置
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="heovose-db"
DB_NAME="heovose_elevate"
DB_USER="heovose"
# 动态检测 MinIO 容器挂载的 volume 卷名称
MINIO_VOLUME=$(docker inspect heovose-storage --format '{{ range .Mounts }}{{ if eq .Destination "/data" }}{{ .Name }}{{ end }}{{ end }}' 2>/dev/null)
if [ -z "$MINIO_VOLUME" ]; then
    MINIO_VOLUME="heovose-base_minio_data"
fi

mkdir -p $BACKUP_DIR

echo "🚀 开始导出 Heovose Elevate 数据..."

# 1. 导出 PostgreSQL 数据库 (使用 gzip 压缩)
echo "📦 正在导出数据库 (PostgreSQL) 并使用 gzip 压缩..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"
cp "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz" "$BACKUP_DIR/db_backup.sql.gz"

# 2. 导出 MinIO 存储数据 (使用 tar -czf 压缩)
echo "📦 正在导出存储桶 (MinIO) 并使用 gzip 压缩..."
docker run --rm -v $MINIO_VOLUME:/data -v $(pwd)/backups:/backup alpine tar czvf /backup/minio_backup_$TIMESTAMP.tar.gz -C /data .
cp "$BACKUP_DIR/minio_backup_$TIMESTAMP.tar.gz" "$BACKUP_DIR/minio_backup.tar.gz"

# 3. 自动清理超过 180 天的旧备份文件
echo "🧹 正在清理超过 180 天的旧备份文件..."
find "$BACKUP_DIR" -type f \( -name "db_backup_*" -o -name "minio_backup_*" \) -mtime +180 -exec rm -f {} \;

echo "✅ 导出完成！最新备份已链接到 $BACKUP_DIR 目录下的标准文件名。"
ls -lh $BACKUP_DIR | grep "$TIMESTAMP"
echo "💡 请妥善保管 $BACKUP_DIR 目录及 .env 文件。"
