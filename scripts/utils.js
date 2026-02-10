// scripts/helper.js

/**
 * Checks if the given element's background color indicates it has been submitted (turned blue)
 * @param {HTMLElement} element - The button element to check
 * @returns {boolean} - True if the element's background color matches the target blue, false otherwise
 */
function isValidWord(element) {
    if (!element) return false;

    const valid = element.style.cssText.includes('--strands-blue');
    if (valid) return true;
    return false;
}

/** Checks if the given element's background color indicates it is a spanagram (turned yellow)
 * @param {HTMLElement} element - The button element to check
 * @returns {boolean} - True if the element's background color matches the target yellow, false otherwise
 */
function isSpanagram(element) {
    if (!element) return false;
    
    const valid = element.style.cssText.includes('--text-spangram');
    if (valid) return true;
    return false;
}

/**
 * Scrapes the grid from the DOM
 * @return {Array} 2D array representing the grid, where each cell is an object { char, element, r, c }
 */
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

/**
 * submit the word by clicking the buttons in the path
 * @param {Array} path - Array of cell objects representing the path of the word
 */
async function submitWord(path) {
    for (const cell of path) {
        const button = document.getElementById(cell.element.id);
        if (button) button.click();
        await new Promise(resolve => setTimeout(resolve, 20));
    }

    const lastCell = path[path.length - 1];
    const lastButton = document.getElementById(lastCell.element.id);
    if (lastButton) {
        // double click to submit
        lastButton.click();
        await new Promise(resolve => setTimeout(resolve, 30));
    }
}

/**
 * Checks if any cell in the path has already been submitted (turned blue)
 * @param {Array} path - Array of cell objects representing the path of the word
 * @param {Set} submittedSet - Set of cell IDs that have already been submitted
 * @returns {boolean} - True if the path contains any submitted cell, false otherwise
 */
function pathContainsSubmitted(path, submittedSet) {
    for (const cell of path) {
        if (submittedSet.has(cell.element.id)) {
            return true;
        }
    }
    return false;
}

/**
 * Checks if the given word is valid according to the trie dictionary
 * @param {String} word - The word to check
 * @param {Object} trieDictionary - The trie dictionary object
 * @returns {boolean} - True if the word is valid according to the trie dictionary, false otherwise
 */
function isValidWordTrie(word, trieDictionary) {
    let node = trieDictionary.root;
    for (const char of word) {
        if (!node.children[char]) {
            return false;
        }
        node = node.children[char];
    }
    return node.isWord;
}