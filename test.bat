@echo off
where "http-server" > %temp%\out123.txt
set /p a=<%temp%\out123.txt
set b="%a%"
del %temp%\out123.txt
node %b% -c-1 --cors