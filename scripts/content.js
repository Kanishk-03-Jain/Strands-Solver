// scripts/content.js

// Listens for messages from the popup.js and starts the solver when requested
chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>  {
  if (request.action === "solve_strands") {
    console.log("Received solve request from popup.");

    // Start the solver process
    startSolver().then(async (result) => {
        console.log("Solver finished. Found:", result.length, "words.");
        await inputWordstoPage(result);
        sendResponse({ status: "success", data: result });
    });

    // 'return true' tells Chrome we will send a response asynchronously
    return true;
  }
});

// Extracts the current grid letters and their corresponding button elements
function getGrid() {
    const grid = [];
    const height = 8;
    const width = 6;

    for (let row = 0; row < height; row++) {
        const gridRow = [];
        for (let col = 0; col < width; col++) {
            const buttonId = `button-${row * width + col}`;
            const button = document.getElementById(buttonId);
            if (button) {
                gridRow.push({
                    char: button.innerText.toLowerCase().trim(),
                    element: button,
                    r: row,
                    c: col
                });
            } else {
                console.warn(`Button not found at row ${row}, col ${col}`);
                gridRow.push(""); // Placeholder for missing button
            }
        }
        grid.push(gridRow);
    }

    console.log("Grid:", grid);
    return grid;
}



async function startSolver() {
    console.log("Starting solver...");

    // Load Trie
    const trieDictionary = await loadTrieDictionary();
    if (!trieDictionary) {
        return [];
    }
    
    const grid = getGrid();
    const rows = grid.length;
    const cols = grid[0].length;
    
    const uniqueResults = new Map();

    const directions = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1],  // Right
        [-1, -1], // Up-Left
        [-1, 1],  // Up-Right
        [1, -1],  // Down-Left
        [1, 1]    // Down-Right 
    ]

    const visited = new Set();
    
    function dfs(r, c, parentNode, path) {

        const cell = grid[r][c];
        if (!cell) return;

        const char = cell.char;

        if (!parentNode.children[char]) return;
        
        const currentNode = parentNode.children[char];

        const key = `${r},${c}`;
        visited.add(key);
        path.push(cell);

        if (currentNode.isWord) {
            const wordStr = path.map(p => p.char).join("");
            if (!uniqueResults.has(wordStr)) {
                uniqueResults.set(wordStr, [...path]);
            }
        }

        // Visit all 8 directions
        for (const [dr, dc] of directions) {
            const newRow = r + dr;
            const newCol = c + dc;

            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                if (!visited.has(`${newRow},${newCol}`)) {
                    dfs(newRow, newCol, currentNode, path);
                }
            }
        }

        // Backtrack
        visited.delete(key);
        path.pop();
    }


    for (let r = 0; r < rows; r++){
        for (let c = 0; c < cols; c++) {
            dfs(r, c, trieDictionary.root, []);
        }
    }
    console.log(uniqueResults);
    return Array.from(uniqueResults, ([word, path]) => ({ word, path }))
                .sort((a, b) => b.word.length - a.word.length);
}

function triggerClick(element) {
    const opts = {
        bubbles: true,
        cancelable: true,
        view: window
    };

    // 1. Mouse Down (Press)
    element.dispatchEvent(new MouseEvent('mousedown', opts));

    // 2. Mouse Up (Release)
    element.dispatchEvent(new MouseEvent('mouseup', opts));
    
    // 3. Click (The resulting event)
    element.dispatchEvent(new MouseEvent('click', opts));
}

async function inputWordstoPage(results) {
    console.log("Inputting words to page...");

    for (const { word, path } of results) {
        console.log(`Submitting word: ${word}`);

        for (let i = 0; i < path.length; i++) {
            const cell = path[i];
            const button = document.getElementById(cell.element.id);
            console.log(`Clicking button for char '${cell.element}' at (${cell.r}, ${cell.c})`);
            if (button) {
                button.click();
                // wait
                await new Promise(resolve => setTimeout(resolve, 100));
                if (i == path.length - 1) {
                    // Last letter, release mouse
                    button.click();
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }
    }
}