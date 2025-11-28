# Codebase Time Machine

Navigate any codebase through time - understand the evolution of features and architectural decisions with an interactive git history explorer.

## 🌟 Features

- **Timeline Visualization**: Interactive commit timeline with search and date filtering
- **Architecture Tracking**: Automatically identify and categorize architectural decisions
- **Code Evolution**: Track how files evolve over time with hotspot analysis
- **Contributor Insights**: See who's contributing and how
- **Diff Viewer**: Side-by-side and unified diff views
- **Commit Patterns**: Analyze commit message patterns and frequency

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- A modern browser (Chrome, Edge, or similar with File System Access API support)

> **Note**: The package uses `@isomorphic-git/lightning-fs` (a scoped npm package). If you encounter any errors during installation, ensure you're using a recent version of npm.

### Installation

Due to PowerShell execution policy restrictions, you'll need to install dependencies using one of these methods:

**Option 1: Using Command Prompt (cmd)**
```cmd
cd c:\Users\akuma\OneDrive\Desktop\magellan-compass-ui\codebase-time-machine
npm install
```

**Option 2: Bypass PowerShell execution policy temporarily**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
```

**Option 3: Use the full path to npm**
```powershell
& "C:\Program Files\nodejs\npm.cmd" install
```

### Running the Application

After installing dependencies, start the development server:

**Using Command Prompt:**
```cmd
npm run dev
```

**Using PowerShell (if execution policy allows):**
```powershell
npm run dev
```

**Or use the full path:**
```powershell
& "C:\Program Files\nodejs\npm.cmd" run dev
```

The application will open at `http://localhost:5173`

## 📖 How to Use

1. **Load a Repository**: Click "Load Git Repository" and select a folder containing a `.git` directory
2. **Explore the Timeline**: Browse through commits, search by message or author, filter by date
3. **View Commits**: Click any commit to see file changes and details
4. **Inspect Diffs**: Click on any changed file to see the code differences
5. **Architecture View**: Switch to the Architecture tab to see significant architectural decisions
6. **Evolution View**: Explore code hotspots, contributor stats, and commit patterns

## 🛠️ Technology Stack

- **React**: UI framework
- **Vite**: Build tool and dev server
- **isomorphic-git**: Pure JavaScript git implementation for browsers
- **lightning-fs**: Virtual filesystem for the browser

## 🎨 Design Features

- Dark mode with vibrant gradients
- Glassmorphism UI elements
- Smooth animations and transitions
- Responsive layout
- Modern typography (Inter font)

## 📁 Project Structure

```
codebase-time-machine/
├── src/
│   ├── components/         # React components
│   │   ├── RepositoryLoader.jsx
│   │   ├── Timeline.jsx
│   │   ├── CommitBrowser.jsx
│   │   ├── CodeViewer.jsx
│   │   ├── ArchitectureTracker.jsx
│   │   └── FeatureEvolution.jsx
│   ├── services/          # Business logic
│   │   ├── gitService.js
│   │   └── analysisService.js
│   ├── utils/             # Utility functions
│   │   └── formatters.js
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## 🔒 Browser Compatibility

This application requires the File System Access API, which is supported in:
- Chrome 86+
- Edge 86+
- Opera 72+

Firefox and Safari do not currently support this API.

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.
