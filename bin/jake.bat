@echo off

FOR /F "tokens=*" %%i in ('C:\cygwin\bin\cygpath.exe "%~dp0../lib/jake.js"') do SET run_dir=%%i
node "%run_dir%" %* 