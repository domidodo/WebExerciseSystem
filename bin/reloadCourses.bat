@echo off 

set outputFile=courseIds.js
set tmpFile=courseIds.tmp

del %outputFile%

dir /b /s course\*.* > %tmpFile%

echo window.supportedCourses = [ >> %outputFile%
for /f "tokens=*" %%A in (%tmpFile%) do if not %%~nxA == .gitkeep echo "%%~nxA", >> %outputFile%
echo ]; >> %outputFile%

del %tmpFile%