// scripts/dictionary.js

/**
 * Trie data structure implementation for efficient prefix-based word searching
 */
class TrieNode {
    constructor() {
        this.children = {};
        this.isWord = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for (const char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isWord = true;
    }
}

/**
 * Loads the dictionary file and returns a Trie of valid words
 * @returns {Promise<Trie|null>} - A promise that resolves to a Trie of valid words or null if an error occurs
 */
window.loadTrieDictionary = async function() {
    try {
        const url = chrome.runtime.getURL('assets/words_alpha.txt');
        const response = await fetch(url);
        const text = await response.text();

        const trie = new Trie();
        const lines = text.split(/\r?\n/);
        console.log("Building trie...");

        for (const line of lines) {
            const w = line.trim().toLowerCase();
            if (w.length >= 4) {
                trie.insert(w);
            }
        }
        console.log(`Dictionary loaded with ${lines.length} words.`);
        return trie;
    } catch (e) {
        console.log(`Error loading dictionary: ${e}`);
        alert("Error loading dictionary file. Check manifest.json permissions.");
        return null;
    }
}