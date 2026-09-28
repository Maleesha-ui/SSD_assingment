#!/bin/bash

# V02 Security Manual Test Script
# This script tests the V02 vulnerability fixes

BASE_URL="http://localhost:5000"
echo "=========================================="
echo "V02 Security Manual Test Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local expected_status=$4
    local token=$5

    echo -n "Testing: $description ... "

    if [ -z "$token" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$url" \
            -H "Authorization: Bearer $token")
    fi

    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}PASSED${NC} (Status: $response)"
        ((PASSED++))
    else
        echo -e "${RED}FAILED${NC} (Expected: $expected_status, Got: $response)"
        ((FAILED++))
    fi
}

echo "=========================================="
echo "PART 1: Unauthenticated Access Tests"
echo "=========================================="
echo ""

# Test unauthenticated access to previously vulnerable endpoints
test_endpoint "GET" "/inventory" "GET /inventory (unauthenticated)" "401"
test_endpoint "POST" "/inventory" "POST /inventory (unauthenticated)" "401"
test_endpoint "GET" "/drivers" "GET /drivers (unauthenticated)" "401"
test_endpoint "POST" "/drivers" "POST /drivers (unauthenticated)" "401"
test_endpoint "GET" "/vehicles" "GET /vehicles (unauthenticated)" "401"
test_endpoint "POST" "/vehicles" "POST /vehicles (unauthenticated)" "401"
test_endpoint "GET" "/assignments" "GET /assignments (unauthenticated)" "401"
test_endpoint "POST" "/assignments" "POST /assignments (unauthenticated)" "401"
test_endpoint "GET" "/supplier" "GET /supplier (unauthenticated)" "401"
test_endpoint "POST" "/supplier" "POST /supplier (unauthenticated)" "401"
test_endpoint "GET" "/inventoryorder" "GET /inventoryorder (unauthenticated)" "401"
test_endpoint "POST" "/inventoryorder" "POST /inventoryorder (unauthenticated)" "401"
test_endpoint "GET" "/maintenance/all" "GET /maintenance/all (unauthenticated)" "401"
test_endpoint "POST" "/maintenance" "POST /maintenance (unauthenticated)" "401"
test_endpoint "GET" "/routes" "GET /routes (unauthenticated)" "401"
test_endpoint "POST" "/routes" "POST /routes (unauthenticated)" "401"
test_endpoint "GET" "/api/admin/debug" "GET /api/admin/debug (unauthenticated)" "401"

echo ""
echo "=========================================="
echo "PART 2: Public Endpoint Tests"
echo "=========================================="
echo ""

# Test public endpoints should still work
test_endpoint "GET" "/api/products" "GET /api/products (public)" "200"
test_endpoint "GET" "/api/public/packages" "GET /api/public/packages (public)" "200"

echo ""
echo "=========================================="
echo "PART 3: Authenticated Access Tests"
echo "=========================================="
echo ""
echo "NOTE: For authenticated tests, you need to:"
echo "1. Start your server: npm start"
echo "2. Get a valid JWT token by logging in"
echo "3. Set the TOKEN variable below with your token"
echo ""

# Check if token is provided
if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}TOKEN not set. Skipping authenticated tests.${NC}"
    echo "To run authenticated tests, set TOKEN variable:"
    echo "export TOKEN='your_jwt_token_here'"
    echo "Then run: bash test_v02_manual.sh"
else
    echo "Using provided token for authenticated tests..."
    echo ""

    # Test customer role restrictions (assuming token is for customer)
    test_endpoint "GET" "/inventory" "GET /inventory (customer)" "403" "$TOKEN"
    test_endpoint "GET" "/drivers" "GET /drivers (customer)" "403" "$TOKEN"
    test_endpoint "GET" "/api/users" "GET /api/users (customer)" "403" "$TOKEN"
    test_endpoint "GET" "/api/orders" "GET /api/orders (customer)" "403" "$TOKEN"
    test_endpoint "GET" "/api/payments" "GET /api/payments (customer)" "403" "$TOKEN"

    # Test customer can access their own resources
    test_endpoint "GET" "/api/orders/history" "GET /api/orders/history (customer)" "200" "$TOKEN"
    test_endpoint "GET" "/api/users/profile/me" "GET /api/users/profile/me (customer)" "200" "$TOKEN"
fi

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}PASSED: $PASSED${NC}"
echo -e "${RED}FAILED: $FAILED${NC}"
echo "TOTAL: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! V02 vulnerability is fixed.${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review the results above.${NC}"
    exit 1
fi
