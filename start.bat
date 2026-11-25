@echo off
title MSKD-klon
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js saknas. Installera LTS-versionen fran https://nodejs.org och dubbelklicka igen.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installerar paket forsta gangen, det tar en liten stund...
  call npm install
  if errorlevel 1 (
    echo Installationen misslyckades.
    pause
    exit /b 1
  )
)
echo Startar sajten pa http://localhost:5173 ...
call npm run dev
pause
