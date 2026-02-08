#!/bin/bash
# watchdog.sh - 监控并保持所有服务活跃

LOG_FILE="/workspaces/myOpenClaw/stock-market-dashboard/watchdog.log"
PID_DIR="/workspaces/myOpenClaw/stock-market-dashboard"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 需要监控的进程
SERVICES=(
  "react-server:react-scripts:3000"
  "proxy-server:node proxy.js:3005"
  "keepalive:keepalive.sh:"
)

# 检查端口是否在监听
check_port() {
  local port=$1
  if lsof -i :$port > /dev/null 2>&1; then
    return 0
  fi
  return 1
}

# 检查进程是否运行
check_process() {
  local name=$1
  local pattern=$2
  
  if pgrep -f "$pattern" > /dev/null 2>&1; then
    return 0
  fi
  return 1
}

# 启动服务
start_service() {
  local name=$1
  local cmd=$2
  local port=$3
  
  log "启动服务: $name"
  
  cd /workspaces/myOpenClaw/stock-market-dashboard
  
  if [ -n "$cmd" ]; then
    eval "nohup $cmd > /dev/null 2>&1 &"
    sleep 3
    
    if [ -n "$port" ]; then
      if check_port $port; then
        log "✓ $name 已启动 (端口: $port)"
        return 0
      fi
    else
      log "✓ $name 已启动"
      return 0
    fi
  fi
  
  log "✗ $name 启动失败"
  return 1
}

# 发送心跳请求
send_heartbeat() {
  local url="https://verbose-goggles-g7v7rgj77j7259p-3005.app.github.dev/api/health"
  local status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 15 "$url" 2>/dev/null)
  
  if [ "$status" = "200" ]; then
    log "✓ 心跳成功 (HTTP $status)"
    return 0
  else
    log "✗ 心跳失败 (HTTP $status)"
    return 1
  fi
}

# 主监控循环
main() {
  log "=== Watchdog守护进程启动 ==="
  log "目标URL: https://verbose-goggles-g7v7rgj77j7259p-3005.app.github.dev/"
  
  while true; do
    # 发送心跳
    send_heartbeat
    
    # 检查各服务状态
    for service in "${SERVICES[@]}"; do
      IFS=':' read -r name pattern port <<< "$service"
      
      if [ -n "$port" ]; then
        if ! check_port $port; then
          log "⚠ 检测到$name端口$port异常，尝试重启..."
          start_service "$name" "$pattern" "$port"
        fi
      else
        if ! check_process "$name" "$pattern"; then
          log "⚠ 检测到$name进程异常，尝试重启..."
          start_service "$name" "$pattern" ""
        fi
      fi
    done
    
    # 等待1分钟后再次检查
    sleep 60
  done
}

# 启动守护进程
daemonize() {
  nohup bash "$0" >> "$LOG_FILE" 2>&1 &
  echo $! > "${PID_DIR}/watchdog.pid"
  log "Watchdog已启动 (PID: $(cat ${PID_DIR}/watchdog.pid))"
}

# 根据参数执行
case "${1:-start}" in
  start)
    daemonize
    ;;
  stop)
    if [ -f "${PID_DIR}/watchdog.pid" ]; then
      PID=$(cat "${PID_DIR}/watchdog.pid")
      kill "$PID" 2>/dev/null
      rm -f "${PID_DIR}/watchdog.pid"
      log "Watchdog已停止"
    fi
    ;;
  status)
    if [ -f "${PID_DIR}/watchdog.pid" ]; then
      PID=$(cat "${PID_DIR}/watchdog.pid")
      if kill -0 "$PID" 2>/dev/null; then
        log "Watchdog正在运行 (PID: $PID)"
      else
        log "Watchdog PID文件存在但进程未运行"
      fi
    else
      log "Watchdog未运行"
    fi
    ;;
  ping)
    send_heartbeat
    ;;
  *)
    echo "用法: $0 {start|stop|status|ping}"
    ;;
esac
