@echo off
cd /d "%~dp0"
start "" "http://127.0.0.1:4179"
node server.mjs 4179
