#!/bin/bash

# Direct Messages Chat Fix - Quick Test Script
# This script helps verify that the chat system is working correctly

echo "=========================================="
echo "Direct Messages Chat System - Test Guide"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Checking if Backend is Running${NC}"
echo "Checking http://localhost:3000..."

if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${YELLOW}⚠ Cannot reach backend. Make sure it's running on port 3000${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Checking if Frontend is Running${NC}"
echo "Checking http://localhost:5173..."

if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${YELLOW}⚠ Cannot reach frontend. Make sure it's running on port 5173${NC}"
fi

echo ""
echo -e "${BLUE}Step 3: Manual Testing Steps${NC}"
echo ""
echo "1. Open your browser and go to: http://localhost:5173/candidate/dashboard/chat"
echo ""
echo "2. Look at the 'Direct Messages' tab and click '+ New Chat'"
echo ""
echo "3. Check the browser console (F12 → Console tab) for logs like:"
echo "   - '🔍 [ChatService] Getting organization users...'"
echo "   - '📌 [ChatService] Token available: ✅ Yes'"
echo "   - '✅ [ChatService] Successfully fetched organization users: X users'"
echo ""
echo "4. Check backend logs for:"
echo "   - '🔍 [CHAT] GET /organization-users'"
echo "   - '📊 [CHAT] Found X users in organization'"
echo "   - '✅ [CHAT] Returning Y users (excluding current)'"
echo ""
echo -e "${BLUE}Step 4: Verify Database${NC}"
echo ""
echo "Run this SQL to check your users:"
echo ""
echo "  SELECT id, name, email, isActive, organizationId FROM users LIMIT 10;"
echo ""
echo "Look for:"
echo "  - Users with isActive = true"
echo "  - Users with the same organizationId as the logged-in user"
echo "  - At least 2 candidates (one for current user, one to chat with)"
echo ""

echo -e "${BLUE}Step 5: Common Issues & Solutions${NC}"
echo ""
echo -e "${YELLOW}Issue: 'No users available' message${NC}"
echo "  Solution 1: Check if users have isActive = true in database"
echo "  Solution 2: Check browser console for error messages"
echo "  Solution 3: Verify token is present in sessionStorage"
echo "  Solution 4: Check if users belong to the same organization"
echo ""
echo -e "${YELLOW}Issue: Cannot see console logs${NC}"
echo "  Solution: Make sure you're on the latest code and restart the frontend"
echo ""
echo -e "${YELLOW}Issue: Token not available${NC}"
echo "  Solution: Log out and log back in to refresh the authentication token"
echo ""

echo -e "${GREEN}✓ Testing guide complete!${NC}"
echo ""
echo "For more details, see: CHAT_DIRECT_MESSAGES_FIX.md"
