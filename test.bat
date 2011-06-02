rem for %%* in (.) do set dir=%%~n*
rem IF NOT %dir%==test cd test
cd test
rm -r *
cd ../
node lib/main.js create test > output.txt 2>&1
cd test
