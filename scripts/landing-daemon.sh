#!/usr/bin/env bash
# TSAI Landing Page dev daemon — start | stop | restart | status | install | uninstall
#
# Binds 127.0.0.1:3040 (pnpm dev).
# Watson command center invokes this script on the Spark host.
#
#   ./scripts/landing-daemon.sh start
#   ./scripts/landing-daemon.sh status --json
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_DIR="${TSAI_LANDING_RUN_DIR:-$ROOT/.run}"
PID_FILE="$RUN_DIR/landing.pid"
LOG_FILE="$RUN_DIR/landing.log"
PORT="${TSAI_LANDING_PORT:-3040}"
HOST="${TSAI_LANDING_HOST:-127.0.0.1}"
UNIT_NAME="tsai-landing.service"
SYSTEMD_UNIT="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user/$UNIT_NAME"

usage() {
  cat <<EOF
Usage: $(basename "$0") {start|stop|restart|status|install|uninstall} [--json]

  start      Launch pnpm dev in background (127.0.0.1:$PORT)
  stop       Stop daemon and free port $PORT
  restart    stop + start
  status     Print running/stopped (add --json for Watson)
  install    Install systemd user unit ($UNIT_NAME) and enable on login
  uninstall  Disable and remove systemd user unit
EOF
}

mkdir -p "$RUN_DIR"

log() { printf '[landing-daemon] %s\n' "$*" >&2; }

read_pid() {
  if [[ -f "$PID_FILE" ]]; then
    tr -d '[:space:]' < "$PID_FILE"
  fi
}

is_pid_alive() {
  local pid="${1:-}"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

port_listener_pids() {
  if command -v ss >/dev/null 2>&1; then
    ss -tlnp 2>/dev/null | awk -v port=":$PORT" '$4 ~ port { print $0 }' | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u
  elif command -v lsof >/dev/null 2>&1; then
    lsof -ti "tcp:$PORT" -sTCP:LISTEN 2>/dev/null || true
  fi
}

http_code() {
  curl -sS -o /dev/null -w '%{http_code}' --max-time 3 "http://${HOST}:${PORT}/" 2>/dev/null || echo "000"
}

ensure_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    command -v pnpm
    return 0
  fi
  if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    source "$HOME/.nvm/nvm.sh"
  fi
  command -v pnpm
}

systemd_state() {
  if command -v systemctl >/dev/null 2>&1 && systemctl --user is-enabled "$UNIT_NAME" >/dev/null 2>&1; then
    systemctl --user is-active "$UNIT_NAME" 2>/dev/null || echo "inactive"
  else
    echo "not-installed"
  fi
}

cmd_start() {
  local pid pnpm_bin systemd
  systemd="$(systemd_state)"
  if [[ "$systemd" != "not-installed" ]]; then
    if [[ "$systemd" == "active" ]]; then
      log "already running (systemd active)"
      return 0
    fi
    log "starting systemd unit $UNIT_NAME"
    systemctl --user start "$UNIT_NAME"
    sleep 3
    local post_http
    post_http="$(http_code)"
    if [[ "$post_http" =~ ^[1-5][0-9][0-9]$ ]]; then
      log "ready (HTTP $post_http, systemd active)"
    else
      log "started systemd unit — waiting for HTTP (check systemctl --user status $UNIT_NAME)"
    fi
    return 0
  fi

  pid="$(read_pid)"
  if is_pid_alive "$pid"; then
    log "already running (pid $pid)"
    return 0
  fi

  pnpm_bin="$(ensure_pnpm)" || {
    log "pnpm not found — install Node/pnpm or source nvm"
    exit 1
  }

  cd "$ROOT"
  : >"$LOG_FILE"
  log "starting Landing Page at http://${HOST}:${PORT} (log: $LOG_FILE)"
  nohup env NODE_OPTIONS="${NODE_OPTIONS:---max-http-header-size=131072}" \
    "$pnpm_bin" dev >>"$LOG_FILE" 2>&1 &
  echo $! >"$PID_FILE"
  sleep 2

  local post_http
  post_http="$(http_code)"
  if [[ "$post_http" =~ ^[1-5][0-9][0-9]$ ]]; then
    log "ready (HTTP $post_http, pid $(read_pid))"
  else
    log "started pid $(read_pid) — waiting for HTTP (check $LOG_FILE)"
  fi
}

cmd_stop() {
  local pid systemd
  systemd="$(systemd_state)"
  if [[ "$systemd" != "not-installed" ]]; then
    log "stopping systemd unit $UNIT_NAME"
    systemctl --user stop "$UNIT_NAME" || true
  fi

  pid="$(read_pid)"
  if is_pid_alive "$pid"; then
    log "stopping pid $pid"
    kill "$pid" 2>/dev/null || true
    for _ in $(seq 1 20); do
      is_pid_alive "$pid" || break
      sleep 0.25
    done
    is_pid_alive "$pid" && kill -9 "$pid" 2>/dev/null || true
  fi

  while read -r lp; do
    [[ -n "$lp" ]] || continue
    log "freeing port $PORT (pid $lp)"
    kill "$lp" 2>/dev/null || true
  done < <(port_listener_pids)

  rm -f "$PID_FILE"
  log "stopped"
}

cmd_restart() {
  cmd_stop
  sleep 1
  cmd_start
}

cmd_status() {
  local json="${1:-false}"
  local pid running http systemd
  pid="$(read_pid)"
  http="$(http_code)"
  systemd="$(systemd_state)"
  running="false"
  if is_pid_alive "$pid" || [[ "$systemd" == "active" ]] || [[ "$http" =~ ^[1-5][0-9][0-9]$ ]]; then
    running="true"
  fi

  if [[ "$json" == "true" ]]; then
    printf '{"running":%s,"pid":"%s","host":"%s","port":%s,"httpCode":"%s","systemd":"%s","logFile":"%s","repoRoot":"%s","localUrl":"http://127.0.0.1:%s"}' \
      "$running" "${pid:-}" "$HOST" "$PORT" "$http" "$systemd" "$LOG_FILE" "$ROOT" "$PORT"
  else
    echo "running=$running pid=${pid:-} port=$PORT http_code=$http systemd=$systemd"
    echo "log=$LOG_FILE"
    echo "url=http://127.0.0.1:$PORT"
  fi
}

cmd_install() {
  local pnpm_bin unit_dir
  pnpm_bin="$(ensure_pnpm)" || {
    log "pnpm not found"
    exit 1
  }
  unit_dir="$(dirname "$SYSTEMD_UNIT")"
  mkdir -p "$unit_dir"

  cat >"$SYSTEMD_UNIT" <<EOF
[Unit]
Description=TSAI Landing Page (Next.js dev on 127.0.0.1:${PORT})
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${ROOT}
Environment=PATH=$(dirname "${pnpm_bin}"):/usr/local/bin:/usr/bin:/bin
Environment=NODE_OPTIONS=--max-http-header-size=131072
Environment=TSAI_LANDING_RUN_DIR=${RUN_DIR}
ExecStart=${pnpm_bin} dev
Restart=on-failure
RestartSec=5
StandardOutput=append:${LOG_FILE}
StandardError=append:${LOG_FILE}

[Install]
WantedBy=default.target
EOF

  systemctl --user daemon-reload
  systemctl --user enable "$UNIT_NAME"
  log "installed $SYSTEMD_UNIT (enabled on user login)"
  log "start now: systemctl --user start $UNIT_NAME  — or: $0 start"
}

cmd_uninstall() {
  if systemctl --user is-active "$UNIT_NAME" >/dev/null 2>&1; then
    systemctl --user stop "$UNIT_NAME" || true
  fi
  systemctl --user disable "$UNIT_NAME" 2>/dev/null || true
  rm -f "$SYSTEMD_UNIT"
  systemctl --user daemon-reload
  cmd_stop
  log "uninstalled $UNIT_NAME"
}

main() {
  local cmd="${1:-}"
  local json="false"
  shift || true
  if [[ "${1:-}" == "--json" ]]; then
    json="true"
  fi

  case "$cmd" in
    start) cmd_start ;;
    stop) cmd_stop ;;
    restart) cmd_restart ;;
    status) cmd_status "$json" ;;
    install) cmd_install ;;
    uninstall) cmd_uninstall ;;
    -h|--help|"") usage; exit 0 ;;
    *) usage; exit 1 ;;
  esac
}

main "$@"
