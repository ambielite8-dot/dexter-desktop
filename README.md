<p align="center">
  <img src="https://img.icons8.com/color/96/verified-account--v1.png" alt="Dexter Logo" width="80" height="80"/>
</p>

<h1 align="center">Dexter</h1>

<p align="center">
  <strong>One Platform. Every Professional. Every Student. Every Goal.</strong>
</p>

<p align="center">
  A permission-based AI co-pilot that operates alongside you in your own platforms, accounts, and workflows.
</p>

---

## What is Dexter?

Dexter is a desktop application with a built-in browser that serves as your AI work assistant. It activates alongside any website you use and provides intelligent recommendations, drafted content, and guidance through a clean sidebar interface.

### Key Features

- **Built-in Browser** — Navigate to any platform and Dexter activates alongside your session
- **Permission-Based AI** — Full control over what Dexter can do autonomously
- **Three Verticals** — Professional, Trader, and Student modes
- **Security First** — Your credentials stay in your browser session
- **Cross-Platform** — Available on Windows, macOS, and Linux

### Permission System

| Level | Description |
|-------|-------------|
| **Full Auto** | Dexter executes immediately without interrupting |
| **Auto with Log** | Dexter executes and records in activity log |
| **Verify First** | Dexter prepares action and waits for your approval |

## Downloads

Download the installer for your platform:

| Platform | File | Size |
|----------|------|------|
| Windows | `Dexter-1.0.0.exe` | ~100 MB |
| macOS | `Dexter-1.0.0.dmg` | ~100 MB |
| Linux | `Dexter-1.0.0.AppImage` | ~100 MB |

## Installation

### macOS & Linux

```bash
chmod +x Dexter-1.0.0.AppImage
./Dexter-1.0.0.AppImage
```

### Windows

Run the installer `.exe` file and follow the installation wizard.

## Development

### Prerequisites

- Node.js 18+
- npm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/dexter-desktop.git
cd dexter-desktop

# Install dependencies
npm install

# Run in development mode
npm start
```

### Building

```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build:linux    # Linux AppImage
npm run build:win       # Windows installer
npm run build:mac       # macOS DMG
```

## Project Structure

```
dexter-desktop/
├── src/
│   ├── main.js        # Electron main process
│   ├── preload.js     # Preload script (IPC bridge)
│   └── index.html     # Main UI
├── build/             # Build resources (icons)
├── dist/              # Build outputs
├── .github/
│   └── workflows/     # GitHub Actions CI/CD
└── package.json       # Project configuration
```

## Documentation

For detailed documentation, see [BUILD.md](./BUILD.md).

## License

MIT License - See [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built with ❤️ by the Dexter team</sub>
</p>
