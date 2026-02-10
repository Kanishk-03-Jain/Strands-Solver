// scripts/content.js
const directions = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1],  // Right
    [-1, -1], // Up-Left
    [-1, 1],  // Up-Right
    [1, -1],  // Down-Left
    [1, 1]    // Down-Right 
];

// Listens for messages from the popup.js and starts the solver when requested
chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>  {
  if (request.action === "solve_strands") {
    console.log("Received solve request from popup.");

    loadTrieDictionary().then(async (trieDictionary) => {
        const grid = getGrid();
        const words = await findPossibleWords(trieDictionary, grid);
        console.log("Solver finished. Found:", words.length, "words.");
        await inputWordstoPage(words, grid, trieDictionary);
        sendResponse({ status: "success", data: words });
    });

    // 'return true' tells Chrome we will send a response asynchronously
    return true;
  }
});


/**
 * Input the found words into the game by clicking the corresponding buttons on the grid
 * @param {Array<Object>} words - Array of objects containing the word and its path on the grid 
 * @param {Array<Array<Object>>} grid - The grid of cells
 */
async function inputWordstoPage(words, grid, trieDictionary) {
    // Keep track of submitted cells to avoid reusing them in multiple words
    const submittedSet = new Set();
    let foundSpanagram = false;

    for (const { word, path } of words) {
        console.log(`Submitting word: ${word}`);

        if (pathContainsSubmitted(path, submittedSet)) {
            console.warn(`Path for word ${word} contains already submitted cells, skipping.`);
            continue;
        }

        await submitWord(path);

        const newButton = document.getElementById(path[path.length - 1].element.id);
        const spanagram = isSpanagram(newButton);

        if (spanagram || isValidWord(newButton)) {
            if (spanagram) {
                console.log(`Word ${word} is a spanagram!`);
                foundSpanagram = true;
            }
            console.log(`Word ${word} accepted! Marking cells as submitted.`);
            for (const c of path) {
                submittedSet.add(c.element.id);
            }
        } else {
            console.warn(`Word ${word} was not accepted by the game.`);
        }
    }

    if (!foundSpanagram) {
        console.warn("No spanagram found among the submitted words. Founding spanagram...");
        
        const possibleSpanagrams = findPossibleSpanagrams(directions, grid, submittedSet);

        for (const { word, path } of possibleSpanagrams) {
            if (isValidSpanagram(word, trieDictionary)) {
                console.log(`Submitting possible spanagram: ${word}`);
                await submitWord(path);
                const newButton = document.getElementById(path[path.length - 1].element.id);
                if (isSpanagram(newButton)) {
                    console.log(`Word ${word} is a spanagram!`);
                    break;
                } else {
                    console.warn(`Word ${word} was not accepted by the game.`);
                }
            }
        }
    }
}

