#!/usr/bin/env bash
cd "$(dirname "$0")"
PORT=38472
URL="http://127.0.0.1:$PORT"

echo ""
echo "  正在启动 Photo Watermark Tools ..."
echo "  访问地址: $URL"
echo "  按 Ctrl+C 停止服务"
echo ""

(sleep 1 && (xdg-open "$URL" 2>/dev/null || open "$URL" 2>/dev/null)) &

if command -v python3 &>/dev/null; then
  exec python3 -m http.server "$PORT"
elif command -v python &>/dev/null; then
  exec python -m http.server "$PORT"
else
  echo "未找到 Python，请安装 Python 3 或改用 Windows 版（双击 start.bat）"
  exit 1
fi
