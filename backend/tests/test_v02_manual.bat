@echo off
REM V02 Security Manual Test Script for Windows
REM This script tests the V02 vulnerability fixes

set BASE_URL=http://localhost:5000
set PASSED=0
set FAILED=0

echo ==========================================
echo V02 Security Manual Test Script (Windows)
echo ==========================================
echo.

echo ==========================================
echo PART 1: Unauthenticated Access Tests
echo ==========================================
echo.

REM Test unauthenticated access to previously vulnerable endpoints
call :test_endpoint "GET" "/inventory" "GET /inventory (unauthenticated)" "401"
call :test_endpoint "POST" "/inventory" "POST /inventory (unauthenticated)" "401"
call :test_endpoint "GET" "/drivers" "GET /drivers (unauthenticated)" "401"
call :test_endpoint "POST" "/drivers" "POST /drivers (unauthenticated)" "401"
call :test_endpoint "GET" "/vehicles" "GET /vehicles (unauthenticated)" "401"
call :test_endpoint "POST" "/vehicles" "POST /vehicles (unauthenticated)" "401"
call :test_endpoint "GET" "/assignments" "GET /assignments (unauthenticated)" "401"
call :test_endpoint "POST" "/assignments" "POST /assignments (unauthenticated)" "401"
call :test_endpoint "GET" "/supplier" "GET /supplier (unauthenticated)" "401"
call :test_endpoint "POST" "/supplier" "POST /supplier (unauthenticated)" "401"
call :test_endpoint "GET" "/inventoryorder" "GET /inventoryorder (unauthenticated)" "401"
call :test_endpoint "POST" "/inventoryorder" "POST /inventoryorder (unauthenticated)" "401"
call :test_endpoint "GET" "/maintenance/all" "GET /maintenance/all (unauthenticated)" "401"
call :test_endpoint "POST" "/maintenance" "POST /maintenance (unauthenticated)" "401"
call :test_endpoint "GET" "/routes" "GET /routes (unauthenticated)" "401"
call :test_endpoint "POST" "/routes" "POST /routes (unauthenticated)" "401"
call :test_endpoint "GET" "/api/admin/debug" "GET /api/admin/debug (unauthenticated)" "401"

echo.
echo ==========================================
echo PART 2: Public Endpoint Tests
echo ==========================================
echo.

REM Test public endpoints should still work
call :test_endpoint "GET" "/api/products" "GET /api/products (public)" "200"
call :test_endpoint "GET" "/api/public/packages" "GET /api/public/packages (public)" "200"

echo.
echo ==========================================
echo PART 3: Authenticated Access Tests
echo ==========================================
echo.
echo NOTE: For authenticated tests, you need to:
echo 1. Make sure your server is running on port 5000
echo 2. Get a valid JWT token by logging in
echo 3. Set the TOKEN environment variable
echo.

if "%TOKEN%"=="" (
    echo TOKEN not set. Skipping authenticated tests.
    echo To run authenticated tests, set TOKEN variable:
    echo set TOKEN=your_jwt_token_here
    echo Then run: test_v02_manual.bat
) else (
    echo Using provided token for authenticated tests...
    echo.

    REM Test customer role restrictions
    call :test_endpoint_with_token "GET" "/inventory" "GET /inventory (customer)" "403"
    call :test_endpoint_with_token "GET" "/drivers" "GET /drivers (customer)" "403"
    call :test_endpoint_with_token "GET" "/api/users" "GET /api/users (customer)" "403"
    call :test_endpoint_with_token "GET" "/api/orders" "GET /api/orders (customer)" "403"
    call :test_endpoint_with_token "GET" "/api/payments" "GET /api/payments (customer)" "403"

    REM Test customer can access their own resources
    call :test_endpoint_with_token "GET" "/api/orders/history" "GET /api/orders/history (customer)" "200"
    call :test_endpoint_with_token "GET" "/api/users/profile/me" "GET /api/users/profile/me (customer)" "200"
)

echo.
echo ==========================================
echo Test Summary
echo ==========================================
echo PASSED: %PASSED%
echo FAILED: %FAILED%
echo TOTAL: %PASSED% + %FAILED%
echo.

if %FAILED%==0 (
    echo All tests passed! V02 vulnerability is fixed.
) else (
    echo Some tests failed. Please review the results above.
)

goto :eof

:test_endpoint
set METHOD=%~1
set URL=%~2
set DESC=%~3
set EXPECTED=%~4

echo - Testing: %DESC% ...
for /f "tokens=*" %%i in ('curl -s -o nul -w "%%{http_code}" -X %METHOD% %BASE_URL%%URL%') do set RESPONSE=%%i

if "%RESPONSE%"=="%EXPECTED%" (
    echo [PASS] Status: %RESPONSE%
    set /a PASSED+=1
) else (
    echo [FAIL] Expected: %EXPECTED%, Got: %RESPONSE%
    set /a FAILED+=1
)
goto :eof

:test_endpoint_with_token
set METHOD=%~1
set URL=%~2
set DESC=%~3
set EXPECTED=%~4

echo - Testing: %DESC% ...
for /f "tokens=*" %%i in ('curl -s -o nul -w "%%{http_code}" -X %METHOD% %BASE_URL%%URL% -H "Authorization: Bearer %TOKEN%"') do set RESPONSE=%%i

if "%RESPONSE%"=="%EXPECTED%" (
    echo [PASS] Status: %RESPONSE%
    set /a PASSED+=1
) else (
    echo [FAIL] Expected: %EXPECTED%, Got: %RESPONSE%
    set /a FAILED+=1
)
goto :eof
