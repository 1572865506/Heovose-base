#!/bin/bash

# 配置
PROJECT_DIR=$(pwd)
LOG_FILE="./backups/update_log.txt"
STATUS_FILE="./backups/update_status.json"

# 记录当前版本 Commit ID，以便更新失败时自动回退
PREV_COMMIT=$(git rev-parse HEAD 2>/dev/null)

mkdir -p ./backups

# 状态写入辅助函数
update_status() {
    local step=$1
    local status=$2
    local err_msg=$3
    echo "{\"status\":\"$status\",\"currentStep\":\"$step\",\"error\":\"$err_msg\",\"updatedAt\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" > $STATUS_FILE
}

# 注册清理钩子，在脚本退出时自动移除维护标记，防止意外崩溃导致卡死在维护模式 (问题 4)
trap 'rm -f .maintenance' EXIT

echo "🚀 [$(date)] 开始执行系统更新..." | tee -a $LOG_FILE
update_status "backup" "running" ""

# 1. 强制备份数据 (安全第一)
echo "📦 正在执行更新前自动备份..." | tee -a $LOG_FILE
./scripts/export-data.sh | tee -a $LOG_FILE

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "❌ 备份失败，终止更新以确保数据安全。" | tee -a $LOG_FILE
    update_status "backup" "failed" "数据自动备份失败，更新已安全终止"
    exit 1
fi
update_status "backup" "success" ""

# 2. 拉取代码
update_status "git_pull" "running" ""
echo "⬇️ 正在从远程仓库拉取最新代码..." | tee -a $LOG_FILE
git pull origin main | tee -a $LOG_FILE

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "❌ Git 拉取失败，请检查网络或冲突。" | tee -a $LOG_FILE
    update_status "git_pull" "failed" "Git 拉取失败，请检查远程仓库连接或本地冲突"
    exit 1
fi
update_status "git_pull" "success" ""

# 3. 更新依赖
update_status "npm_install" "running" ""
echo "📦 正在同步依赖项..." | tee -a $LOG_FILE
npm install | tee -a $LOG_FILE

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "❌ npm install 失败，依赖更新中断。" | tee -a $LOG_FILE
    update_status "npm_install" "failed" "npm install 依赖同步失败"
    exit 1
fi
update_status "npm_install" "success" ""

# 3.1. 数据库 Schema 架构自动同步 (修复问题 6)
update_status "db_push" "running" ""
echo "🔄 正在同步数据库 Schema 结构..." | tee -a $LOG_FILE
npx prisma db push --accept-data-loss | tee -a $LOG_FILE

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "❌ 数据库同步失败。" | tee -a $LOG_FILE
    update_status "db_push" "failed" "Prisma 数据库 Schema 结构同步失败"
    exit 1
fi
update_status "db_push" "success" ""

# 4. 重新构建
update_status "build" "running" ""
echo "🏗️ 正在重新构建项目 (这可能需要 1-3 分钟)..." | tee -a $LOG_FILE
env UV_THREADPOOL_SIZE=1 NODE_OPTIONS="--max-old-space-size=1024" npm run build | tee -a $LOG_FILE

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "✅ [$(date)] 系统更新构建成功！" | tee -a $LOG_FILE
    update_status "build" "success" ""
else
    echo "❌ [$(date)] 构建失败，正在尝试自动回退至上一版本..." | tee -a $LOG_FILE
    update_status "build" "failed" "Next.js 生产环境打包编译失败 (内存不足或代码编译错误)"
    if [ ! -z "$PREV_COMMIT" ]; then
        echo "⏪ 正在回滚代码到 Commit ID: $PREV_COMMIT ..." | tee -a $LOG_FILE
        git reset --hard $PREV_COMMIT | tee -a $LOG_FILE
        npm install | tee -a $LOG_FILE
        env UV_THREADPOOL_SIZE=1 NODE_OPTIONS="--max-old-space-size=1024" npm run build | tee -a $LOG_FILE
        echo "✅ 已成功回退至更新前的稳定版本。" | tee -a $LOG_FILE
    else
        echo "⚠️ 未找到上一个版本的 Commit 记录，无法自动回退。" | tee -a $LOG_FILE
    fi
    exit 1
fi

echo "🎉 更新流程全部完成！" | tee -a $LOG_FILE
update_status "restart" "running" ""

# 自动重启 Web 容器以激活内存中的新 Next.js 进程 (通过挂载 of /var/run/docker.sock)
if command -v docker >/dev/null 2>&1 && docker ps >/dev/null 2>&1; then
    echo "🔄 检测到 Docker 守护进程，正在延迟 2 秒后重启 Web 容器以激活新版本..." | tee -a $LOG_FILE
    update_status "restart" "success" ""
    (sleep 2 && docker restart heovose-web) >/dev/null 2>&1 &
else
    update_status "restart" "success" ""
fi
