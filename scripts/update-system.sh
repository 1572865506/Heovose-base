#!/bin/bash

# 配置
PROJECT_DIR=$(pwd)
LOG_FILE="$PROJECT_DIR/backups/update_log.txt"
STATUS_FILE="$PROJECT_DIR/backups/update_status.json"

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
echo "📦 正在执行更新前自动备份..." >> $LOG_FILE 2>&1
./scripts/export-data.sh >> $LOG_FILE 2>&1

if [ $? -ne 0 ]; then
    echo "❌ 备份失败，终止更新以确保数据安全。" >> $LOG_FILE 2>&1
    update_status "backup" "failed" "数据自动备份失败，更新已安全终止"
    exit 1
fi
update_status "backup" "success" ""

# 2. 拉取代码
update_status "git_pull" "running" ""
echo "⬇️ 正在从远程仓库拉取最新代码..." >> $LOG_FILE 2>&1
git pull origin main >> $LOG_FILE 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Git 拉取失败，请检查网络或冲突。" >> $LOG_FILE 2>&1
    update_status "git_pull" "failed" "Git 拉取失败，请检查远程仓库连接或本地冲突"
    exit 1
fi
update_status "git_pull" "success" ""

# 3. 更新依赖
update_status "npm_install" "running" ""
echo "📦 正在同步依赖项..." >> $LOG_FILE 2>&1
npm install >> $LOG_FILE 2>&1

if [ $? -ne 0 ]; then
    echo "❌ npm install 失败，依赖更新中断。" >> $LOG_FILE 2>&1
    update_status "npm_install" "failed" "npm install 依赖同步失败"
    exit 1
fi
update_status "npm_install" "success" ""

# 3.1. 数据库 Schema 架构自动同步 (修复问题 6)
update_status "db_push" "running" ""
echo "🔄 正在同步数据库 Schema 结构..." >> $LOG_FILE 2>&1
npx prisma db push --accept-data-loss >> $LOG_FILE 2>&1

if [ $? -ne 0 ]; then
    echo "❌ 数据库同步失败。" >> $LOG_FILE 2>&1
    update_status "db_push" "failed" "Prisma 数据库 Schema 结构同步失败"
    exit 1
fi
update_status "db_push" "success" ""

# 4. 重新构建 (使用影子目录独立构建编译，防止覆盖/损坏当前正在运行服务的 .next 目录)
update_status "build" "running" ""
echo "🏗️ 正在创建影子编译空间并重新构建项目..." | tee -a $LOG_FILE

# 创建临时的影子编译文件夹，将代码复制过去进行编译 (放在项目目录的上一级，彻底绕过 Next.js 的本地文件监听器，防止 500 报错)
SHADOW_DIR="$(dirname "$PROJECT_DIR")/heovose_shadow_build"
rm -rf $SHADOW_DIR
mkdir -p $SHADOW_DIR

# 复制项目必要的文件和依赖（排除备份文件夹和大体积多余内容，包含关键的环境变量 .env* 配置文件以防静态编译报错）
echo "📂 正在同步构建所需的运行资产..." | tee -a $LOG_FILE
cp -R $PROJECT_DIR/src $SHADOW_DIR/ 2>/dev/null || true
cp -R $PROJECT_DIR/prisma $SHADOW_DIR/ 2>/dev/null || true
cp -R $PROJECT_DIR/public $SHADOW_DIR/ 2>/dev/null || true
# 使用软链接替代复制 node_modules，避免数万个文件复制导致 I/O 锁死或内存溢出 (OOM)
ln -sf $PROJECT_DIR/node_modules $SHADOW_DIR/node_modules
cp $PROJECT_DIR/.env* $SHADOW_DIR/ 2>/dev/null || true
cp $PROJECT_DIR/package.json $PROJECT_DIR/package-lock.json $PROJECT_DIR/next.config.ts $PROJECT_DIR/tsconfig.json $PROJECT_DIR/tailwind.config.ts $PROJECT_DIR/postcss.config.mjs $PROJECT_DIR/postcss.config.js $SHADOW_DIR/ 2>/dev/null || true

# 进入影子目录进行单线程轻量化编译，保证原 /app/.next 不受任何影响，后台正常显示进度
cd $SHADOW_DIR
echo "🏗️ 开始在影子目录中执行 Next.js 编译..." >> $LOG_FILE 2>&1
env UV_THREADPOOL_SIZE=1 NODE_OPTIONS="--max-old-space-size=2048" npm run build >> $LOG_FILE 2>&1

if [ $? -eq 0 ]; then
    echo "✅ [$(date)] 影子编译成功！进行原子级文件夹快速切换..." >> $LOG_FILE 2>&1
    cd $PROJECT_DIR
    mv .next .next_old 2>/dev/null || true
    mv $SHADOW_DIR/.next .next
    rm -rf .next_old
    rm -rf $SHADOW_DIR
    update_status "build" "success" ""
else
    echo "❌ [$(date)] 影子编译失败，正在清理影子工作区..." >> $LOG_FILE 2>&1
    update_status "build" "failed" "Next.js 影子环境打包编译失败 (内存不足或代码编译错误)"
    cd $PROJECT_DIR
    rm -rf $SHADOW_DIR
    
    # 根据项目路径判断：只有在阿里云生产环境 (/mnt/nvme1n1/) 下才执行生产回滚重编译
    if [[ "$PROJECT_DIR" == /mnt/nvme1n1* ]] && [ ! -z "$PREV_COMMIT" ]; then
        echo "⏪ 正在回滚代码到 Commit ID: $PREV_COMMIT ..." >> $LOG_FILE 2>&1
        git reset --hard $PREV_COMMIT >> $LOG_FILE 2>&1
        npm install >> $LOG_FILE 2>&1
        env UV_THREADPOOL_SIZE=1 NODE_OPTIONS="--max-old-space-size=2048" npm run build >> $LOG_FILE 2>&1
        echo "✅ 已成功回退至更新前的稳定版本。" >> $LOG_FILE 2>&1
    else
        echo "⚠️ 检测到本地 WSL 开发环境，直接执行版本退回，不跑生产回滚构建以保护开发缓存。" >> $LOG_FILE 2>&1
        if [ ! -z "$PREV_COMMIT" ]; then
            git reset --hard $PREV_COMMIT >> $LOG_FILE 2>&1
        fi
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
