#!/bin/bash

# 配置
PROJECT_DIR=$(pwd)
LOG_FILE="./backups/update_log.txt"

# 记录当前版本 Commit ID，以便更新失败时自动回退
PREV_COMMIT=$(git rev-parse HEAD 2>/dev/null)

mkdir -p ./backups

# 注册清理钩子，在脚本退出时自动移除维护标记，防止意外崩溃导致卡死在维护模式 (问题 4)
trap 'rm -f .maintenance' EXIT

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

# 3.1. 数据库 Schema 架构自动同步 (修复问题 6)
echo "🔄 正在同步数据库 Schema 结构..." | tee -a $LOG_FILE
npx prisma db push --accept-data-loss | tee -a $LOG_FILE

# 4. 重新构建
echo "🏗️ 正在重新构建项目 (这可能需要 1-3 分钟)..." | tee -a $LOG_FILE
npm run build | tee -a $LOG_FILE


if [ $? -eq 0 ]; then
    echo "✅ [$(date)] 系统更新构建成功！" | tee -a $LOG_FILE
    # 如果使用 pm2，可以取消注释下面一行
    # pm2 restart all
else
    echo "❌ [$(date)] 构建失败，正在尝试自动回退至上一版本..." | tee -a $LOG_FILE
    if [ ! -z "$PREV_COMMIT" ]; then
        echo "⏪ 正在回滚代码到 Commit ID: $PREV_COMMIT ..." | tee -a $LOG_FILE
        git reset --hard $PREV_COMMIT | tee -a $LOG_FILE
        npm install | tee -a $LOG_FILE
        npm run build | tee -a $LOG_FILE
        echo "✅ 已成功回退至更新前的稳定版本。" | tee -a $LOG_FILE
    else
        echo "⚠️ 未找到上一个版本的 Commit 记录，无法自动回退。" | tee -a $LOG_FILE
    fi
    exit 1
fi

echo "🎉 更新流程全部完成！" | tee -a $LOG_FILE

# 自动重启 Web 容器以激活内存中的新 Next.js 进程 (通过挂载的 /var/run/docker.sock)
if command -v docker >/dev/null 2>&1 && docker ps >/dev/null 2>&1; then
    echo "🔄 检测到 Docker 守护进程，正在延迟 2 秒后重启 Web 容器以激活新版本..." | tee -a $LOG_FILE
    (sleep 2 && docker restart heovose-web) >/dev/null 2>&1 &
fi
