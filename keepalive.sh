#!/bin/bash
# keepalive.sh - 保持Codespace活跃的脚本

while true; do
  # 记录时间戳
  echo "$(date): Keeping Codespace alive..." >> /tmp/keepalive.log
  
  # 执行一些轻量级操作
  uptime
  free -h | head -2
  
  # 等待15分钟
  sleep 900
done