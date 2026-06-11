@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Photo Watermark Tools
echo.
echo  正在启动 Photo Watermark Tools ...
echo  请勿直接双击 index.html，必须通过本脚本启动。
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
if errorlevel 1 pause
