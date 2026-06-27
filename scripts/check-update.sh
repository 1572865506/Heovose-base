#!/bin/bash

# 检查 git 是否可用
if ! command -v git &> /dev/null; then
    echo "ERROR|Git command not found"
    exit 1
fi

# 检查是否在 git 仓库中
if [ ! -d ".git" ]; then
    echo "ERROR|Not a git repository"
    exit 1
fi

# 1. 获取远程仓库最新状态
git fetch origin main > /dev/null 2>&1

# 2. 获取本地与远程的差异
LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)

if [ -z "$LOCAL" ] || [ -z "$REMOTE" ]; then
    echo "ERROR|Failed to resolve git revisions"
    exit 1
fi

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "UP_TO_DATE"
else
    # 输出差异的提交记录数量和摘要
    COUNT=$(git rev-list --count HEAD..origin/main)
    LOGS=$(git log HEAD..origin/main --oneline -n 5)
    echo "NEW_UPDATES|$COUNT|$LOGS"
fi
