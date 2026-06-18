@echo off
chcp 65001 >nul
cd /d "d:\桌面\flash\app"

set EAS_NO_VCS=1
set PATH=C:\Program Files\nodejs;%PATH%

echo ========================================
echo   Flash - iOS 开发版构建
echo ========================================
echo.
echo 接下来会提示你登录 Apple ID（免费即可）
echo 按照屏幕提示操作即可
echo.
pause

npx eas build --platform ios --profile development
pause
