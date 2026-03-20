# Building Dexter Desktop

## Prerequisites

- Node.js 18+ 
- npm 8+

## Installation

```bash
npm install
```

## Building Icons

If you need to regenerate icons:

```bash
npm run build:icons
```

## Building for Specific Platforms

### Linux (AppImage)

```bash
npm run build:linux
```

Output: `dist/Dexter-1.0.0.AppImage`

### Windows (NSIS Installer)

**On Windows:**
```bash
npm run build:win
```

Output: `dist/Dexter-1.0.0-Setup.exe`

**Note:** Building Windows installers on Linux/macOS requires Wine for NSIS. The portable zip is available at `dist/Dexter-1.0.0-win-portable.tar.gz`.

### macOS (DMG)

**On macOS:**
```bash
npm run build:mac
```

Output: `dist/Dexter-1.0.0.dmg`

**Note:** Building macOS apps requires macOS.

## Building All Platforms

```bash
npm run build
```

## Cross-Platform Notes

| Platform | Native Build | Cross-Compile |
|----------|-------------|---------------|
| Linux   | ✅ AppImage | N/A          |
| Windows | ✅ NSIS/Portable | ⚠️ Requires Wine |
| macOS   | ✅ DMG      | ❌ Not supported |

## Generated Files

- `dist/Dexter-1.0.0.AppImage` - Linux AppImage
- `dist/linux-unpacked/` - Linux unpacked build
- `dist/win-unpacked/` - Windows unpacked build
- `dist/Dexter-1.0.0-win-portable.tar.gz` - Windows portable package

## Windows Installer

To create a proper Windows NSIS installer, run on Windows:

```bash
npm install
npm run build:win
```

The NSIS installer will be created at `dist/Dexter-1.0.0-Setup.exe`
