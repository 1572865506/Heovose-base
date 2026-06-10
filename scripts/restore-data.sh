#!/bin/sh

# 配置
BACKUP_DIR="./backups"
DB_CONTAINER="heovose-db"
DB_NAME="heovose_elevate"
DB_USER="heovose"
MINIO_VOLUME="heovose-base_minio_data"

# 获取参数
TARGET_SQL=$1
TARGET_MINIO=$2

# 如果未提供参数，则使用默认的标准文件名
if [ -z "$TARGET_SQL" ]; then
    TARGET_SQL="$BACKUP_DIR/db_backup.sql.gz"
    if [ ! -f "$TARGET_SQL" ]; then
        TARGET_SQL="$BACKUP_DIR/db_backup.sql"
    fi
fi
if [ -z "$TARGET_MINIO" ]; then
    TARGET_MINIO="$BACKUP_DIR/minio_backup.tar.gz"
    if [ ! -f "$TARGET_MINIO" ]; then
        TARGET_MINIO="$BACKUP_DIR/minio_backup.tar"
    fi
fi

echo "🚀 开始从 $TARGET_SQL 还原 Heovose Elevate 数据..."

# 0. 还原前自动创建当前数据的临时备份，防止还原出错无法恢复 (问题 1)
echo "📦 正在执行还原前自动临时备份..."
sh ./scripts/export-data.sh

# 1. 还原 PostgreSQL 数据库
if [ -f "$TARGET_SQL" ]; then
    echo "📦 正在清理并还原数据库 (PostgreSQL)..."
    # 先清理 schema，确保是一个干净的还原环境
    docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; ALTER SCHEMA public OWNER TO $DB_USER;"
    
    # 判断是否为 gzip 压缩包并还原
    case "$TARGET_SQL" in
        *.gz)
            gunzip -c "$TARGET_SQL" | docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME
            ;;
        *)
            docker exec -i $DB_CONTAINER psql -U $DB_USER $DB_NAME < "$TARGET_SQL"
            ;;
    esac
else
    echo "⚠️ 错误: 未找到数据库备份文件 $TARGET_SQL"
    exit 1
fi

# 2. 还原 MinIO 存储数据
if [ -f "$TARGET_MINIO" ]; then
    echo "📦 正在还原存储桶 (MinIO)..."
    # 先清理旧数据，再解压新数据 (判断是否为 gzip 压缩包)
    case "$TARGET_MINIO" in
        *.gz)
            docker run --rm -v $MINIO_VOLUME:/data -v $(pwd)/backups:/backup alpine sh -c "rm -rf /data/* && tar xzvf /backup/$(basename $TARGET_MINIO) -C /data"
            ;;
        *)
            docker run --rm -v $MINIO_VOLUME:/data -v $(pwd)/backups:/backup alpine sh -c "rm -rf /data/* && tar xvf /backup/$(basename $TARGET_MINIO) -C /data"
            ;;
    esac
else
    echo "⚠️ 错误: 未找到存储桶备份文件 $TARGET_MINIO"
    exit 1
fi

echo "✅ 还原完成！"
