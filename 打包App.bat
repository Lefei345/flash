@echo off
title Flash 打包
echo ==========================================
echo   Flash - 打包成独立 App
echo ==========================================
echo.
echo 按提示输入你的 Apple ID 邮箱和密码
echo （就是 iPhone 上 App Store 用的那个）
echo.
pause

cd /d "d:\桌面\flash\app"
set PATH=C:\Program Files\nodejs;%USERPROFILE%\PortableGit\bin;%PATH%
npx eas build --platform ios --profile development
pause
