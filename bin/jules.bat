@echo off

FOR /F "tokens=*" %%i in ('C:\cygwin\bin\cygpath.exe "%~dp0"') do SET run_dir=%%i 
rem FOR /F "tokens=*" %%i in ('C:\cygwin\bin\cygpath.exe -a "%run_dir:~0,-1%../lib/main.js"') do SET goFile=%%i 

node "%run_dir:~0,-1%../lib/main.js" %*

rem set goFile=%{"C:\cygwin\bin\cygpath.exe" "%run_dir:~0,-1%../lib/main.js"}

rem echo 'node "%goFile%" %*' | bash
