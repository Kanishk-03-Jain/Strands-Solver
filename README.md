# NYT Strands Solver

A Chrome Extension designed to automatically solve the [New York Times Strands](https://www.nytimes.com/games/strands) puzzle.

It uses a smart algorithms to parse the game grid, find all valid dictionary words, and attempt to highlight them on the board for you.

## Features

- **Automatic Grid Detection**: Scrapes the current letter grid from the NYT page.
- **Advanced Solver Algorithm**:
  - Uses **Depth-First Search (DFS)** to traverse the grid in all 8 directions (horizontal, vertical, diagonal).
  - Powered by a **Trie (Prefix Tree) Data Structure** for extremely fast dictionary lookups.
- **Visual Interaction**: Automatically clicks through the letters on the game board to submit the found words.
- **Smart Feedback**:
  - Detects if a word is accepted (turns blue).
  - Skips already used letters to avoid conflicts.
- **Simple Popup Interface**: One-click "⚡ Solve Puzzle" button.

## Installation

Since this extension is not yet on the Chrome Web Store, you need to install it in **Developer Mode**:

1.  **Clone or Download** this repository to your computer.
2.  Open **Google Chrome** and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** using the toggle in the top-right corner.
4.  Click the **Load unpacked** button.
5.  Select the folder containing this project (the one with `manifest.json`).

## Usage

1.  Go to the [NYT Strands Game](https://www.nytimes.com/games/strands).
2.  Click the **Strands Solver** extension icon in your browser toolbar.
3.  Click the **⚡ Solve Puzzle** button.
4.  Watch as the solver:
    - Scans the grid.
    - Calculates valid words (this might take a second).
    - Starts highlighting words on the board automatically!

> **Note**: The solver finds *all* valid dictionary words. The game only accepts specific "theme" words and the "Spangram". The solver will prioritize longer words, which often include the theme words.

## Detailed Logic

1.  **Grid Parsing**: The extension identifies the 6x8 grid of letters on the page.
2.  **Dictionary Loading**: It loads a large dictionary (`words_alpha.txt`) into a Trie for efficient prefix checking.
3.  **Recursive Search**: It runs a DFS from every cell to find valid word paths.
4.  **Execution**: It sorts found words by length (longest first) and attempts to input them into the game by simulating clicks.

## Future Improvements

- [ ] **Covering Algorithm**: Instead of greedy longest words, find the set of words that perfectly covers the grid.
