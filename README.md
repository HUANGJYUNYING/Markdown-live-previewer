# Mermaid Lens Pro

A professional, real-time editor for **Mermaid.js** diagrams and **Markdown** documentation.

<div align="center">
  <!-- You can replace this with a screenshot of the new UI later -->
  <h3>Live Editor • Dual Mode • High-Res Export</h3>
</div>

## Features

### 🧜‍♀️ Mermaid Diagram Editor
- **Real-time Rendering**: Instantly visualize flowcharts, sequence diagrams, gantt charts, and more.
- **Smart Controls**: Drag to pan, Ctrl+Scroll to zoom.
- **Theme Support**: Switch between Default, Neutral, Dark, and Forest themes.
- **Export Options**: 
  - **PNG** (High Fidelity)
  - **JPG** (Compressed)
  - **SVG** (Vector / Resolution Independent)

### 📝 Markdown Editor
- **Full GFM Support**: Write standard GitHub Flavored Markdown.
- **Rich Preview**: Immediate rendering of headers, lists, links, and code blocks.
- **Export**: Save your work as `.md` files.

### ⚡ Efficient Workflow
- **Tab Indentation**: Supports 2-space indentation with the Tab key.
- **Clean UI**: Minimalist, distraction-free interface.
- **Local Execution**: Runs entirely in your browser/locally.

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)

### Installation

1. Clone the repository (if applicable) or download the source.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:
```bash
npm run dev
```

Open your browser to `http://localhost:5173` (or the port shown in your terminal).

## Usage

1. **Switch Modes**: Use the toggle in the top header to switch between `Mermaid` and `Markdown` modes.
   > **Note**: Switching modes will reset the current editor content.
2. **Editing**: Type on the left panel.
3. **Preview**: See the result on the right panel.
4. **Download**: Click the **Download** button in the header to save your creation.

---
*Built with React, Vite, Mermaid.js, and Lucide React.*
