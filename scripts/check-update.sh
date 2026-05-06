#!/bin/bash

# 1. 获取远程仓库最新状态
git fetch origin main > /dev/null 2>&1

# 2. 获取本地与远程的差异
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "UP_TO_DATE"
else
    # 输出差异的提交记录数量和摘要
    COUNT=$(git rev-list --count HEAD..origin/main)
    LOGS=$(git log HEAD..origin/main --oneline -n 5)
    echo "NEW_UPDATES|$COUNT|$LOGS"
fi
