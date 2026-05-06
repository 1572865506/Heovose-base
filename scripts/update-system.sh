#!/bin/bash

# 配置
PROJECT_DIR=$(pwd)
LOG_FILE="./backups/update_log.txt"

mkdir -p ./backups

echo "🚀 [$(date)] 开始执行系统更新..." | tee -a $LOG_FILE

# 1. 强制备份数据 (安全第一)
echo "📦 正在执行更新前自动备份..." | tee -a $LOG_FILE
./scripts/export-data.sh | tee -a $LOG_FILE

# 2. 拉取代码
echo "⬇️ 正在从远程仓库拉取最新代码..." | tee -a $LOG_FILE
git pull origin main | tee -a $LOG_FILE

if [ $? -ne 0 ]; then
    echo "❌ Git 拉取失败，请检查网络或冲突。" | tee -a $LOG_FILE
    exit 1
fi

# 3. 更新依赖
echo "📦 正在同步依赖项..." | tee -a $LOG_FILE
npm install | tee -a $LOG_FILE

# 4. 重新构建
echo "🏗️ 正在重新构建项目 (这可能需要 1-3 分钟)..." | tee -a $LOG_FILE
npm run build | tee -a $LOG_FILE

if [ $? -eq 0 ]; then
    echo "✅ [$(date)] 系统更新构建成功！" | tee -a $LOG_FILE
    # 如果使用 pm2，可以取消注释下面一行
    # pm2 restart all
else
    echo "❌ [$(date)] 构建失败，正在尝试保留旧版本..." | tee -a $LOG_FILE
    exit 1
fi

echo "🎉 更新流程全部完成！" | tee -a $LOG_FILE
