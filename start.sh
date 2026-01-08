#!/bin/bash

# SA-DASH Quick Start Script
# This script helps you quickly set up and run the SA-DASH application

set -e

echo "╔════════════════════════════════════════════════════╗"
echo "║   SA-DASH - Situation Awareness Dashboard         ║"
echo "║   Quick Start Setup                                ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check if in correct directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this script from the sa-dash directory."
    exit 1
fi

echo "✅ Found SA-DASH files"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Detect available server options
SERVERS_AVAILABLE=()

if command_exists python3; then
    SERVERS_AVAILABLE+=("python3")
fi

if command_exists python; then
    SERVERS_AVAILABLE+=("python")
fi

if command_exists node; then
    SERVERS_AVAILABLE+=("node")
fi

if command_exists npx; then
    SERVERS_AVAILABLE+=("npx")
fi

if [ ${#SERVERS_AVAILABLE[@]} -eq 0 ]; then
    echo "❌ Error: No suitable web server found."
    echo ""
    echo "Please install one of the following:"
    echo "  - Python 3 (recommended): https://www.python.org/"
    echo "  - Node.js: https://nodejs.org/"
    exit 1
fi

echo "Available server options:"
echo ""

# Present options to user
PS3="Select a server option (1-${#SERVERS_AVAILABLE[@]}): "

declare -a OPTIONS
declare -a COMMANDS

for server in "${SERVERS_AVAILABLE[@]}"; do
    case $server in
        python3)
            OPTIONS+=("Python 3 HTTP Server (port 8000)")
            COMMANDS+=("python3 -m http.server 8000")
            ;;
        python)
            OPTIONS+=("Python HTTP Server (port 8000)")
            COMMANDS+=("python -m http.server 8000")
            ;;
        node)
            OPTIONS+=("Node.js HTTP Server (port 8000)")
            COMMANDS+=("npm run start 2>/dev/null || npx http-server -p 8000")
            ;;
        npx)
            OPTIONS+=("NPX HTTP Server (port 8000)")
            COMMANDS+=("npx http-server -p 8000 -o")
            ;;
    esac
done

select opt in "${OPTIONS[@]}" "Quit"; do
    case $REPLY in
        [1-9])
            if [ $REPLY -le ${#OPTIONS[@]} ]; then
                SELECTED_CMD="${COMMANDS[$REPLY-1]}"
                break
            fi
            ;;
        $((${#OPTIONS[@]}+1)))
            echo "Exiting."
            exit 0
            ;;
        *)
            echo "Invalid option. Please try again."
            ;;
    esac
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Starting SA-DASH..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Server will be available at: http://localhost:8000"
echo "🌐 Open this URL in your browser to view the dashboard"
echo ""
echo "💡 Tip: Click 'Refresh' in the header to load initial data"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the server
eval "$SELECTED_CMD"
