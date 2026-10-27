#!/bin/bash
# ==============================================================================
# Heovose Elevate 一键版本安全回退脚本 (带代码与数据双重回滚安全保护)
# ==============================================================================

PROJECT_DIR=$(pwd)
LOG_FILE="$PROJECT_DIR/backups/update_log.txt"
STATUS_FILE="$PROJECT_DIR/backups/update_status.json"
ROLLBACK_INFO_FILE="$PROJECT_DIR/backups/rollback_info.json"

# 参数 1：是否同时还原数据 (true/false, 默认为 true)
ROLLBACK_DATA=${1:-"true"}

mkdir -p "$PROJECT_DIR/backups"

# 状态写入辅助函数
update_status() {
    local step=$1
    local status=$2
    local err_msg=$3
    echo "{\"status\":\"$status\",\"currentStep\":\"$step\",\"error\":\"$err_msg\",\"updatedAt\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" > $STATUS_FILE
}

# 注册清理钩子，在脚本退出时自动移除维护标记
trap 'rm -f .maintenance' EXIT

# 校验快照元数据是否存在
if [ ! -f "$ROLLBACK_INFO_FILE" ]; then
    echo "❌ [$(date)] 未找到版本快照信息 (rollback_info.json)，无法执行自动回退。" | tee -a $LOG_FILE
    update_status "rollback" "failed" "未找到上一版本的历史快照信息，无法执行版本回退"
    exit 1
fi

# 解析快照信息
PREV_COMMIT=$(node -e "try { const d = require('$ROLLBACK_INFO_FILE'); console.log(d.prevCommit || ''); } catch(e) { console.log(''); }")
DB_BACKUP=$(node -e "try { const d = require('$ROLLBACK_INFO_FILE'); console.log(d.dbBackup || ''); } catch(e) { console.log(''); }")
MINIO_BACKUP=$(node -e "try { const d = require('$ROLLBACK_INFO_FILE'); console.log(d.minioBackup || ''); } catch(e) { console.log(''); }")

if [ -z "$PREV_COMMIT" ]; then
    echo "❌ [$(date)] 快照中的目标回退 Commit ID 为空，回退终止。" | tee -a $LOG_FILE
    update_status "rollback" "failed" "目标回退 Commit ID 为空，回退终止"
    exit 1
fi

echo "🚀 [$(date)] 开始执行系统安全版本回退 (目标版本: $PREV_COMMIT, 回退数据: $ROLLBACK_DATA)..." | tee -a $LOG_FILE
update_status "rollback" "running" ""

# 1. 如果用户选择回退数据，执行数据库与存储桶的精准恢复
if [ "$ROLLBACK_DATA" = "true" ] && [ -n "$DB_BACKUP" ] && [ -f "$PROJECT_DIR/backups/$DB_BACKUP" ]; then
    echo "📦 正在将数据库与对象存储还原至更新前快照 ($DB_BACKUP)..." | tee -a $LOG_FILE
    ./scripts/restore-data.sh "$PROJECT_DIR/backups/$DB_BACKUP" "$PROJECT_DIR/backups/$MINIO_BACKUP" >> $LOG_FILE 2>&1
    
    if [ $? -ne 0 ]; then
        echo "❌ 数据快照还原失败，终止代码回退以保护数据环境一致性。" | tee -a $LOG_FILE
        update_status "rollback" "failed" "数据快照还原失败，回退已安全终止"
        exit 1
    fi
    echo "✅ 数据库与对象存储已成功恢复至更新前状态。" | tee -a $LOG_FILE
fi

# 2. 回退 Git 代码指针
echo "⏪ 正在回退 Git 代码至 Commit: $PREV_COMMIT ..." | tee -a $LOG_FILE
git reset --hard $PREV_COMMIT >> $LOG_FILE 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Git 代码指针回退失败。" | tee -a $LOG_FILE
    update_status "rollback" "failed" "Git 代码重置失败"
    exit 1
fi
echo "✅ Git 代码已重置至目标版本。" | tee -a $LOG_FILE

# 3. 极速切换编译目录 (.next)
if [ -d "$PROJECT_DIR/.next_previous" ]; then
    echo "⚡ 检测到上一版本的物理编译缓存，执行秒级零等待原子切换..." | tee -a $LOG_FILE
    mv .next .next_rolled_forward 2>/dev/null || true
    mv .next_previous .next
    rm -rf .next_rolled_forward
    echo "✅ 生产包已瞬间完成还原。" | tee -a $LOG_FILE
else
    echo "🏗️ 未检测到上一版本预编译缓存，启动轻量影子重编译..." | tee -a $LOG_FILE
    SHADOW_DIR="$(dirname "$PROJECT_DIR")/heovose_shadow_build"
    rm -rf $SHADOW_DIR
    mkdir -p $SHADOW_DIR
    
    cp -R $PROJECT_DIR/src $SHADOW_DIR/ 2>/dev/null || true
    cp -R $PROJECT_DIR/prisma $SHADOW_DIR/ 2>/dev/null || true
    cp -R $PROJECT_DIR/public $SHADOW_DIR/ 2>/dev/null || true
    ln -sf $PROJECT_DIR/node_modules $SHADOW_DIR/node_modules
    cp $PROJECT_DIR/.env* $SHADOW_DIR/ 2>/dev/null || true
    cp $PROJECT_DIR/package.json $PROJECT_DIR/package-lock.json $PROJECT_DIR/next.config.ts $PROJECT_DIR/tsconfig.json $PROJECT_DIR/tailwind.config.ts $PROJECT_DIR/postcss.config.mjs $PROJECT_DIR/postcss.config.js $SHADOW_DIR/ 2>/dev/null || true
    
    cd $SHADOW_DIR
    nice -n 19 env UV_THREADPOOL_SIZE=1 NODE_OPTIONS="--max-old-space-size=2048" npm run build >> $LOG_FILE 2>&1
    
    if [ $? -eq 0 ]; then
        cd $PROJECT_DIR
        mv .next .next_old 2>/dev/null || true
        mv $SHADOW_DIR/.next .next
        rm -rf .next_old $SHADOW_DIR
        echo "✅ 影子编译兜底成功并已切换。" | tee -a $LOG_FILE
    else
        cd $PROJECT_DIR
        rm -rf $SHADOW_DIR
        echo "❌ 影子编译失败。" | tee -a $LOG_FILE
        update_status "rollback" "failed" "影子环境重构建失败"
        exit 1
    fi
fi

# 4. 移除快照文件，标记回退已完成
rm -f "$ROLLBACK_INFO_FILE"

echo "🎉 [$(date)] 版本回退流程圆满完成！" | tee -a $LOG_FILE
update_status "rollback" "success" ""

# 5. 自动重启 Web 容器以激活回退后的版本
if command -v docker >/dev/null 2>&1 && docker ps >/dev/null 2>&1; then
    echo "🔄 正在重启 Web 容器加载回退后的版本..." | tee -a $LOG_FILE
    (sleep 1 && docker restart heovose-web) >/dev/null 2>&1 &
fi
