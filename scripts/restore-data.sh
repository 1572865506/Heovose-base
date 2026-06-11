#!/bin/sh

# 配置
BACKUP_DIR="./backups"
DB_CONTAINER="heovose-db"
DB_NAME="heovose_elevate"
DB_USER="heovose"

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

# 0. 还原前自动创建当前数据的临时备份 (默认注释掉，防止混淆并提高还原速度；如需开启请取消注释)
# echo "📦 正在执行还原前自动临时备份..."
# sh ./scripts/export-data.sh

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

# 2. 还原 MinIO 存储数据 (使用 stdin 管道解压导入，并使用 --volumes-from 直接挂载容器的存储路径，解决卷名和挂载路径差异问题)
if [ -f "$TARGET_MINIO" ]; then
    echo "📦 正在还原存储桶 (MinIO)..."
    # 2.1 清理旧数据
    docker run --rm --volumes-from heovose-storage alpine sh -c "rm -rf /data/*"
    # 2.2 管道流式导入解压
    case "$TARGET_MINIO" in
        *.gz)
            docker run -i --rm --volumes-from heovose-storage alpine tar xzf - -C /data < "$TARGET_MINIO"
            ;;
        *)
            docker run -i --rm --volumes-from heovose-storage alpine tar xf - -C /data < "$TARGET_MINIO"
            ;;
    esac
    
    # 2.3 重启 MinIO 容器以重新加载并索引磁盘上的还原文件 (至关重要)
    echo "🔄 正在重启 MinIO 存储容器以应用更新..."
    docker restart heovose-storage
else
    echo "⚠️ 错误: 未找到存储桶备份文件 $TARGET_MINIO"
    exit 1
fi

echo "✅ 还原完成！"
