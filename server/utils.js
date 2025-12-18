import * as fs from 'fs/promises';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const wordListPath = path.join(__dirname, 'node_modules', 'word-list', 'words.txt');

async function getWordsByLength(lengths) {
    try {
        const data = await fs.readFile(wordListPath, 'utf8');
        const words = data
            .split('\n')
            .map((word) => word.trim().toLowerCase())
            .filter(Boolean);

        const supportedLengths = Array.from(new Set(lengths));
        const lengthSet = new Set(supportedLengths);
        const byLength = Object.fromEntries(supportedLengths.map((length) => [length, []]));

        for (const word of words) {
            if (lengthSet.has(word.length)) {
                byLength[word.length].push(word);
            }
        }

        return byLength;
    } catch (err) {
        if (process.env.NODE_ENV !== 'test') {
            console.error("Error reading words.txt file:", err);
        }
        return Object.fromEntries(lengths.map((length) => [length, []]));
    }
}

const wordLists = await getWordsByLength([4, 5, 6]);

export const fourLetterWords = wordLists[4];
export const fiveLetterWords = wordLists[5];
export const sixLetterWords = wordLists[6];

export default fiveLetterWords;
