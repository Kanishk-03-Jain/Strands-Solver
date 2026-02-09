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

/**
 * Starts the solver by loading the dictionary, scraping the grid, and finding all valid words
 * @return {Promise<Array>} - A promise that resolves to an array of found words and their paths
 */
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
    
    /**
     * Depth-first search to find all valid words starting from (r, c)
     * @param {int} r row index
     * @param {int} c column index
     * @param {Object} parentNode  current node in the trie
     * @param {Array<Object>} path  current path of cells forming the word
     */
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
    return Array.from(uniqueResults, ([word, path]) => ({ word, path }))
                .sort((a, b) => b.word.length - a.word.length);
}

/**
 * Input the found words into the game by clicking the corresponding buttons on the grid
 * @param {Array<Object>} words - Array of objects containing the word and its path on the grid 
 */
async function inputWordstoPage(words) {
    console.log("Inputting words to page...");

    // Keep track of submitted cells to avoid reusing them in multiple words
    submittedSet = new Set();

    for (const { word, path } of words) {
        console.log(`Submitting word: ${word}`);

        if (pathContainsSubmitted(path, submittedSet)) {
            console.warn(`Path for word ${word} contains already submitted cells, skipping.`);
            continue;
        }

        await submitWord(path);

        const newButton = document.getElementById(path[path.length - 1].element.id);
        if (newButton && isValid(newButton)) {
            // Word accepted, mark cells as submitted
            console.log(`Word ${word} accepted! Marking cells as submitted.`);
            for (const c of path) {
                submittedSet.add(c.element.id);
            }
        } else {
            console.warn(`Word ${word} was not accepted by the game.`);
        }
    }
}