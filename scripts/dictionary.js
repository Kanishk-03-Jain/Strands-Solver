// scripts/dictionary.js

window.loadDictionary = async function() {
    try {
        const url = chrome.runtime.getURL('assets/words_alpha.txt');
        const response = await fetch(url);
        const text = await response.text();

        const words = new Set(
            text.split(/\r?\n/)
            .map(w => w.trim().toLowerCase())
        );

        console.log(`Dictionary loaded with ${words.size} words`);
        return words;
    } catch (e) {
        console.log(`Error loading dictionary: ${e}`);
        alert("Error loading dictionary file. Check manifest.json permissions.");
        return null;
    }
}