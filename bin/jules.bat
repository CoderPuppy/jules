@echo off

FOR /F "tokens=*" %%i in ('C:\cygwin\bin\cygpath.exe "%~dp0"') do SET run_dir=%%i 

node "%run_dir:~0,-1%../lib/main.js" %*
