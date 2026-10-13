@echo off
chcp 65001 >nul
echo 正在啟動番茄簡譜 (純離線 Web 版)...
start "" http://localhost:8080/
node serve.js
pause
