import fs from 'fs/promises';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const wordListPath = path.join(__dirname, 'node_modules', 'word-list', 'words.txt');

async function getFiveLetterWords() {
    try {
        const data = await fs.readFile(wordListPath, 'utf8');
        const words = data.split('\n').map(word => word.trim());
        return words.filter(word => word.length === 5); // Filter for 5-letter words
    } catch (err) {
        console.error("Error reading words.txt file:", err);
        return [];
    }
}

const fiveLetterWords = await getFiveLetterWords();
export default fiveLetterWords;