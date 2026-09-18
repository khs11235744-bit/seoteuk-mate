@echo off
setlocal
cd /d "%~dp0"
title Seoteuk Mate - Antigravity DEV Bridge v2.6
chcp 65001 >nul

echo ============================================================
echo  Seoteuk Mate - Antigravity DEV Bridge v2.6
echo ============================================================
echo.

set "AGY_EXE=%LOCALAPPDATA%\agy\bin\agy.exe"
where agy >nul 2>nul
if %errorlevel%==0 goto :agy_ok
if exist "%AGY_EXE%" goto :agy_ok

echo [1/2] Antigravity CLI ^(agy^)를 찾지 못했습니다.
echo.
echo 공식 설치 명령 ^(PowerShell^):
echo   irm https://antigravity.google/cli/install.ps1 ^| iex
echo.
echo 설치 후 새 PowerShell에서 agy를 한 번 실행해 로그인까지 완료한 다음
pause
goto :eof

:agy_ok
echo [1/2] Antigravity CLI 확인 완료
where agy 2>nul
if exist "%AGY_EXE%" echo %AGY_EXE%
echo.
echo [2/2] 로컬 브리지를 시작합니다.
echo 브리지 창은 웹앱 사용 중 닫지 마세요.
echo.

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 antigravity-bridge.py
  goto :end
)
where python >nul 2>nul
if %errorlevel%==0 (
  python antigravity-bridge.py
  goto :end
)

echo Python 3를 찾지 못했습니다.
echo https://www.python.org/downloads/ 에서 설치한 뒤 다시 실행하세요.
pause

:end
endlocal
