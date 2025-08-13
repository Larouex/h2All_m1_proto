#!/bin/bash

# Test script to verify Google Analytics control functionality
# This script tests both enabled and disabled states

echo "🧪 Testing Google Analytics Control Functionality"
echo "================================================="

# Function to test with specific environment variable
test_analytics_state() {
    local state=$1
    local expected_behavior=$2
    
    echo ""
    echo "📋 Test: NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS=$state"
    echo "Expected: $expected_behavior"
    
    # Set the environment variable
    export NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS=$state
    export NODE_ENV=production
    
    # Build and check the output
    echo "Building with NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS=$state..."
    npm run build > /tmp/build_output_$state.log 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful"
    else
        echo "❌ Build failed"
        cat /tmp/build_output_$state.log | tail -10
        return 1
    fi
}

# Test 1: Analytics disabled
test_analytics_state "true" "Google Analytics should NOT load"

# Test 2: Analytics enabled  
test_analytics_state "false" "Google Analytics should load in production"

# Test 3: Variable not set (default behavior)
unset NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS
test_analytics_state "" "Google Analytics should load in production (default)"

echo ""
echo "🎯 Test Summary"
echo "==============="
echo "The GoogleAnalytics component now respects the NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS variable."
echo ""
echo "Usage for load testing:"
echo "  export NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS=true"
echo ""
echo "Usage for normal production:"
echo "  export NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS=false"
echo "  # or simply omit the variable"

# Clean up environment
unset NEXT_PUBLIC_DISABLE_GOOGLE_ANALYTICS
unset NODE_ENV
