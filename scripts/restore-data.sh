#!/bin/bash

BACKUP_DIR="./backups"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ 错误: 未找到 $BACKUP_DIR 文件夹，请确保已将备份拷贝到项目根目录。"
    exit 1
fi

echo "🚀 开始恢复 Heovose Elevate 数据..."

# 1. 启动容器
echo "⚙️ 正在启动 Docker 容器..."
docker-compose up -d

# 等待数据库就绪
echo "⏳ 等待数据库启动..."
sleep 8

# 2. 恢复数据库
echo "📥 正在恢复数据库..."
if [ -f "$BACKUP_DIR/db_backup.sql" ]; then
    cat "$BACKUP_DIR/db_backup.sql" | docker exec -i heovose-db psql -U heovose -d heovose_elevate
else
    echo "⚠️ 跳过数据库恢复: 未找到 db_backup.sql"
fi

# 3. 恢复 MinIO 数据
echo "📥 正在恢复存储桶数据..."
VOLUME_NAME=$(docker volume ls -q | grep "minio_data" | head -n 1)

if [ -z "$VOLUME_NAME" ]; then
    echo "❌ 错误: 未找到新设备的 MinIO Volume，请确保 docker-compose 已成功启动。"
elif [ -f "$BACKUP_DIR/minio_backup.tar" ]; then
    cat "$BACKUP_DIR/minio_backup.tar" | docker run --rm -i -v "$VOLUME_NAME":/to alpine tar -xvf - -C /to
else
    echo "⚠️ 跳过存储恢复: 未找到 minio_backup.tar"
fi

echo "✅ 恢复操作完成！"
echo "🌐 提示: 运行 'npm run dev' 启动应用。"
