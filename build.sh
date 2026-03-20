#!/bin/bash

set -e

echo "================================================"
echo "  Dexter Desktop - Cross-Platform Build Script"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is required but not installed.${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

echo ""
echo "Available build targets:"
echo "  1. All platforms (Linux, Windows, macOS)"
echo "  2. Linux only (AppImage)"
echo "  3. Windows only (NSIS installer)"
echo "  4. macOS only (DMG)"
echo "  5. Build icons only"
echo ""

read -p "Select build target (1-5): " choice

case $choice in
    1)
        echo -e "${GREEN}Building for all platforms...${NC}"
        npm run build
        ;;
    2)
        echo -e "${GREEN}Building for Linux...${NC}"
        npm run build:linux
        ;;
    3)
        echo -e "${GREEN}Building for Windows...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            npm run build:win
        else
            echo -e "${YELLOW}Note: Windows builds on Linux require wine for NSIS installer.${NC}"
            echo -e "${YELLOW}Building portable version instead...${NC}"
            npm run build:win
        fi
        ;;
    4)
        echo -e "${GREEN}Building for macOS...${NC}"
        if [[ "$OSTYPE" == "linux"* ]]; then
            echo -e "${YELLOW}Note: macOS builds require macOS.${NC}"
            echo -e "${YELLOW}Please run this script on a macOS machine.${NC}"
        else
            npm run build:mac
        fi
        ;;
    5)
        echo -e "${GREEN}Generating icons...${NC}"
        node build/create-icons.js
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Build complete!${NC}"
echo "Output directory: dist/"
ls -la dist/ 2>/dev/null || true
