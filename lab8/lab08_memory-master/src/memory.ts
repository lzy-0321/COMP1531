import fs from 'fs';

interface Game {
  score: number;
  mistakesRemaining: number;
  cluesRemaining: number;
  dictionary: string[];
}

const currentGame: Game = {
  score: 0,
  mistakesRemaining: 3,
  cluesRemaining: 3,
  dictionary: [],
};

// Note: key "dictionary" is NOT returned in this function.
export function getGameInfo() {
  return {
    score: currentGame.score,
    mistakesRemaining: currentGame.mistakesRemaining,
    cluesRemaining: currentGame.cluesRemaining,
  };
}

export function addWord(word: string) {
  if (currentGame.mistakesRemaining <= 0) {
    throw new Error('Game over!');
  }
  if (currentGame.dictionary.includes(word)) {
    currentGame.mistakesRemaining--;
    throw new Error(`Word '${word}' already exists in dictionary!`);
  }
  currentGame.dictionary.push(word);
  currentGame.score++;
}

export function removeWord(word: string) {
  if (currentGame.mistakesRemaining <= 0) {
    throw new Error('Game over!');
  }
  const index = currentGame.dictionary.indexOf(word);
  if (index === -1) {
    currentGame.mistakesRemaining--;
    throw new Error(`Word '${word}' does not exist in dictionary!`);
  }
  currentGame.dictionary.splice(index, 1);
  currentGame.score++;
}

export function viewDictionary() {
  if (currentGame.cluesRemaining <= 0) {
    if (currentGame.mistakesRemaining <= 0) {
      throw new Error('Game over!');
    }
    throw new Error('No more clues left!');
  }
  currentGame.cluesRemaining--;
  return currentGame.dictionary;
}

export function resetGame() {
  currentGame.score = 0;
  currentGame.mistakesRemaining = 3;
  currentGame.cluesRemaining = 3;
  currentGame.dictionary = [];
}

export function saveGame(name: string) {
  if (name === '' || name.match(/[^a-zA-Z0-9]/)) {
    throw new Error('Invalid name!');
  } else if (fs.existsSync(`memory_${name}.json`)) {
    throw new Error(`File memory_${name}.json already exists!`);
  }
  const data = JSON.stringify(currentGame);
  fs.writeFileSync(`memory_${name}.json`, data);
}

export function loadGame(name: string) {
  if (name === '' || name.match(/[^a-zA-Z0-9]/)) {
    throw new Error('Invalid name!');
  } else if (!fs.existsSync(`memory_${name}.json`)) {
    throw new Error(`File memory_${name}.json does not exist!`);
  }
  const data = fs.readFileSync(`memory_${name}.json`);
  const game = JSON.parse(data.toString());
  currentGame.score = game.score;
  currentGame.mistakesRemaining = game.mistakesRemaining;
  currentGame.cluesRemaining = game.cluesRemaining;
  currentGame.dictionary = game.dictionary;
}
