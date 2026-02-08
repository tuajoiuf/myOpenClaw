#!/bin/bash
# 简单的URL保持活跃脚本
# 使用crontab格式，每5分钟请求一次

TARGET_URL="https://verbose-goggles-g7v7rgj77j7259p-3005.app.github.dev/"
LOG_FILE="/workspaces/myOpenClaw/stock-market-dashboard/keepalive.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# 主函数
main() {
  log "=== Keepalive启动 ==="
  
  while true; do
    status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 "$TARGET_URL" 2>/dev/null)
    
    if [ "$status" = "200" ]; then
      log "✓ 保持活跃成功 (HTTP $status)"
    else
      log "✗ 请求失败 (HTTP $status)"
    fi
    
    sleep 300  # 每5分钟
  done
}

# 启动
nohup bash "$0" > /dev/null 2>&1 &
echo $! > /workspaces/myOpenClaw/stock-market-dashboard/keepalive.pid
log "Keepalive进程已启动"