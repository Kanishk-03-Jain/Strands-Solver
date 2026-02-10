/**
 * Depth-first search to find all valid words starting from (r, c)
 * @param {int} r row index
 * @param {int} c column index
 * @param {Object} parentNode  current node in the trie
 * @param {Array<Object>} path  current path of cells forming the word
 */
function findWordsDFS(r, c, parentNode, path, visited, uniqueResults, grid, directions) {
    const rows = grid.length;
    const cols = grid[0].length;
    const cell = grid[r][c];
    if (!cell) return;

    const char = cell.char;

    if (!parentNode.children[char]) return;
    
    const currentNode = parentNode.children[char];

    visited.add(cell.element.id);
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

        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && !visited.has(grid[newRow][newCol].element.id)) {
            findWordsDFS(newRow, newCol, currentNode, path, visited, uniqueResults, grid, directions);
        }
    }

    // Backtrack
    visited.delete(cell.element.id);
    path.pop();
}


/**
 * Starts the solver by loading the dictionary, scraping the grid, and finding all valid words
 * @return {Promise<Array>} - A promise that resolves to an array of found words and their paths
 */
async function findPossibleWords(trieDictionary, grid) {
    console.log("Finding Words...");
    
    const uniqueResults = new Map();
    const visited = new Set();
    
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
            findWordsDFS(r, c, trieDictionary.root, [], visited, uniqueResults, grid, directions);
        }
    }
    return Array.from(uniqueResults, ([word, path]) => ({ word, path }))
                .sort((a, b) => b.word.length - a.word.length);
}


/**
 * Checks if the given string can form a valid spanagram (single word or multiple valid words)
 * Uses Word Break algorithm (Dynamic Programming)
 * @param {string} str - The string to check
 * @param {Object} trieDictionary - The trie dictionary object
 * @returns {boolean} - True if the string is a valid spanagram
 */
function isValidSpanagram(str, trieDictionary) {
    const n = str.length;
    if (n === 0) return false;
    
    // dp[i] will be true if str[0..i-1] can be segmented into valid words
    const dp = new Array(n + 1).fill(false);
    dp[0] = true;

    for (let i = 1; i <= n; i++) {
        for (let j = 0; j < i; j++) {
            if (dp[j]) {
                const sub = str.substring(j, i);
                if (isValidWordTrie(sub, trieDictionary)) {
                    dp[i] = true;
                    break;
                }
            }
        }
    }
    return dp[n];
}


/**
 * Finds possible spanagrams starting from (r, c)
 * @param {number} r  - row index
 * @param {number} c - column index
 * @param {Array<Object>} path - current path of cells forming the potential spanagram
 * @param {Array<Object>} possibleSpanagram - map to store found spanagrams and their paths
 * @param {number} unmarkedCells - number of cells that have not been submitted yet
 * @param {Array<Array<number>>} directions - directions to move in the grid
 * @param {Array<Array<Object>>} grid - the grid of cells
 * @param {Set} submittedSet - set of cell IDs that have already been submitted
 * @returns {void}
 */
function findSpanagramsDFS(r, c, path, possibleSpanagram, unmarkedCells, directions, grid, submittedSet) {
    if (unmarkedCells == 0) {
        // Validation: Spanagram must touch opposite sides (Left-Right or Top-Bottom)
        const start = path[0];
        const end = path[path.length - 1];
        const rows = grid.length;
        const cols = grid[0].length;
        
        let touchesOpposite = false;
        
        // Check Top-Bottom (Row 0 to Row 7)
        if ((start.r === 0 && end.r === rows - 1) || (start.r === rows - 1 && end.r === 0)) {
            touchesOpposite = true;
        }
        
        // Check Left-Right (Col 0 to Col 5)
        if ((start.c === 0 && end.c === cols - 1) || (start.c === cols - 1 && end.c === 0)) {
            touchesOpposite = true;
        }

        if (touchesOpposite) {
            console.log(`Found possible spanagram candidate path: ${path.map(p => p.char).join("")}`);
            possibleSpanagram.set(path.map(p => p.char).join(""), [...path]);
        }
        return;
    }
    submittedSet.add(grid[r][c].element.id);

    for (const [dr, dc] of directions) {
        const newRow = r + dr;
        const newCol = c + dc;

        if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[newRow].length ) {
            const cell = grid[newRow][newCol];
            if (cell && !submittedSet.has(cell.element.id)) {
                path.push(cell);
                findSpanagramsDFS(newRow, newCol, path, possibleSpanagram, unmarkedCells - 1, directions, grid, submittedSet);
                path.pop();
            }
        }
    } 
    submittedSet.delete(grid[r][c].element.id); 
    return Array.from(possibleSpanagram, ([word, path]) => ({ word, path }))
}


/**
 * Finds possible spanagrams on the grid
 * @param {Array<Array<number>>} directions - directions to move in the grid
 * @param {Array<Array<Object>>} grid - the grid of cells
 * @param {Set<string>} submittedSet  - set of cell IDs that have already been submitted
 * @returns {Array<Object>} - Array of objects containing the possible spanagram words and their paths
 */
function findPossibleSpanagrams(directions, grid, submittedSet) {
    let unmarkedCells = 6 * 8 - submittedSet.size;
    const possibleSpanagram = new Map();
    console.log(`Finding possible spanagrams with ${unmarkedCells} unmarked cells...`);
    
    const rows = grid.length;
    const cols = grid[0].length;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // Optimization: Only start searching from boundary cells
            const isBoundary = (r === 0 || r === rows - 1 || c === 0 || c === cols - 1);
            
            if (isBoundary) {
                const cell = grid[r][c];
                if (cell && !submittedSet.has(cell.element.id)) {
                    findSpanagramsDFS(r, c, [cell], possibleSpanagram, unmarkedCells - 1, directions, grid, submittedSet);
                }
            }
        }
    }
    return Array.from(possibleSpanagram, ([word, path]) => ({ word, path }));
}