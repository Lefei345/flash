@echo off
title Flash iOS 构建
echo ============================================
echo   Flash - 按住说话松手就存
echo   iOS 开发版云端构建
echo ============================================
echo.
echo 按提示操作：输入 Apple ID 和密码
echo （和你在 iPhone App Store 用的一样）
echo.

cd /d "d:\桌面\flash\app"
set "PATH=C:\Program Files\nodejs;%USERPROFILE%\PortableGit\bin;%PATH%"

npx eas build --platform ios --profile development

echo.
echo 构建结束！按任意键退出...
pause >nul
