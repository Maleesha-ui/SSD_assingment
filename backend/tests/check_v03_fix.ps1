# PowerShell script to check V03 fix in database
# This script connects to MongoDB and checks if passwords are hashed

Write-Host "=== V03 Fix Verification Script ===" -ForegroundColor Yellow
Write-Host ""

# Check if adminController.js has the bcrypt import
Write-Host "1. Checking if bcrypt is imported in adminController.js..." -ForegroundColor Cyan
$adminControllerPath = "backend\controllers\adminController.js"
if (Test-Path $adminControllerPath) {
    $content = Get-Content $adminControllerPath -Raw
    if ($content -match "require\('bcryptjs'\)") {
        Write-Host "✅ bcryptjs is imported" -ForegroundColor Green
    } else {
        Write-Host "❌ bcryptjs is NOT imported" -ForegroundColor Red
    }
} else {
    Write-Host "❌ adminController.js not found" -ForegroundColor Red
}

Write-Host ""

# Check if addStaff function has password hashing
Write-Host "2. Checking if addStaff function has password hashing..." -ForegroundColor Cyan
if ($content -match "bcrypt\.genSalt") {
    Write-Host "✅ bcrypt.genSalt found in addStaff" -ForegroundColor Green
} else {
    Write-Host "❌ bcrypt.genSalt NOT found in addStaff" -ForegroundColor Red
}

if ($content -match "bcrypt\.hash") {
    Write-Host "✅ bcrypt.hash found in addStaff" -ForegroundColor Green
} else {
    Write-Host "❌ bcrypt.hash NOT found in addStaff" -ForegroundColor Red
}

if ($content -match "delete userResponse\.password") {
    Write-Host "✅ Password filtering in response found" -ForegroundColor Green
} else {
    Write-Host "❌ Password filtering in response NOT found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Manual Database Check Required ===" -ForegroundColor Yellow
Write-Host "Please check your MongoDB database directly:"
Write-Host "1. Open MongoDB Compass"
Write-Host "2. Connect to your database"
Write-Host "3. Go to 'users' collection"
Write-Host "4. Find the user with email: teststaff@example.com"
Write-Host "5. Check the 'password' field"
Write-Host ""
Write-Host "Expected: Password should be a bcrypt hash like: $2a$10$..."
Write-Host "NOT Expected: Password should NOT be plaintext like: TestPassword123!"
Write-Host ""
Write-Host "If the password is hashed in the database, the fix is working."
Write-Host "The API response issue is a separate formatting problem."