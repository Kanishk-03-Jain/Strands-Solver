# NYT Strands Solver (WIP)

A Chrome Extension designed to automatically solve the [New York Times Strands](https://www.nytimes.com/games/strands) puzzle.

> 🚧 **Project Status: Work In Progress**
> 
> Currently, the extension can successfully scrape the game grid and uses a Trie DFS algorithm to find valid words from a dictionary. The visual interaction (highlighting/submitting words on the game board) is currently in development.

## Features

- **Game Grid Scraping**: Automatically detects the letter grid on the NYT Strands page.
- **Word Finding Algorithm**: Uses Depth-First Search (DFS) with a Trie data structure to find all valid words formed by connecting adjacent letters (horizontal, vertical, and diagonal).
- **Extension Popup**: Simple interface to trigger the solver.

## Installation

Since this extension is not yet on the Chrome Web Store, you need to install it in **Developer Mode**:

1.  Clone or download this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Toggle **Developer mode** in the top-right corner.
4.  Click **Load unpacked**.
5.  Select the directory containing this project (the folder containing `manifest.json`).

## Usage

1.  Navigate to the [NYT Strands Game](https://www.nytimes.com/games/strands).
2.  Click the **Strands Solver** extension icon in your browser toolbar.
3.  Click the **⚡ Solve Puzzle** button.
4.  *Current Behavior*: The solver calculates valid words. (Check the browser console/popup debug logs for the output while visual features are being built).

## Development Roadmap

- [x] Basic Extension Structure (Manifest, Popup)
- [x] Grid Parsing Logic
- [x] DFS Word Search Algorithm
- [x] Dictionary Optimization (Prefix Tree/Trie for faster search)
- [ ] **Visual Solver**: Automatically highlight/drag across letters on the web page to submit words.
- [ ] Display found words list in the Popup.
