#!/bin/bash
# 简化版keepalive - 每5分钟ping一次URL

URL="https://verbose-goggles-g7v7rgj77j7259p-3005.app.github.dev/"
LOG="/workspaces/myOpenClaw/stock-market-dashboard/simple-ping.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Ping started" >> "$LOG"

while true; do
    status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$URL" 2>/dev/null)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] HTTP $status" >> "$LOG"
    sleep 300
done &
