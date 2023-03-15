export function wordsquare(words: string[]): string[] | string {
  const wordLength = words[0].length;
  const result = [];
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    for (let j = 0; j < wordLength; j++) {
      if (words.includes(word)) {
        result.push(word);
        word = word.slice(1) + word[0];
      } else {
        break;
      }
    }
    if (result.length === wordLength) {
      return result;
    }
    result.length = 0;
  }
  return 'No solution found';
}