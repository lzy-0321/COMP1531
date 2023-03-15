interface Wordplay {
  word: string; // Hayden
  progress: string; // Ha*den
  mistakes: number; // 2
}

export function wordplay_create(word: string): Wordplay {
  if (word.length === 0) {
    throw new Error('Word must not be empty');
  }
  if (!/^[A-Z]+$/.test(word)) {
    throw new Error('INVALID WORD');
  }
  return {
    word: word,
    progress: '*'.repeat(word.length),
    mistakes: 0,
  };
}

export function wordplay_guess(wordplay: Wordplay, guess: string): string {
  if (wordplay.mistakes === wordplay.word.length) {
    return 'GAME OVER';
  }
  const before = wordplay.progress;
  for (let i = 0; i < wordplay.word.length; i++) {
    if (wordplay.word[i] === guess) {
      wordplay.progress = wordplay.progress.slice(0, i) + guess + wordplay.progress.slice(i + 1);
    }
  }
  if (wordplay.progress === before) {
    wordplay.mistakes++;
  }
  if (wordplay.progress === wordplay.word) {
    return 'VICTORY';
  }
  return wordplay.progress;
}
