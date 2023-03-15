import fs from 'fs';

import {
  getGameInfo,
  addWord,
  removeWord,
  viewDictionary,
  resetGame,
  loadGame,
  saveGame,
} from './memory';

// Helper function to remove all memory_[NAME].json files in
// the current directory.
function removeSavedGames() {
  fs.readdirSync('./')
    .filter(file => /^memory_[a-zA-Z0-9]+\.json$/.test(file))
    .forEach(file => fs.unlinkSync('./' + file));
}

function clear() {
  removeSavedGames();
  resetGame();
}

beforeAll(() => {
  clear();
});

afterEach(() => {
  clear();
});

describe('addWord', () => {
  test('adding the same word twice', () => {
    expect(() => addWord('hello')).not.toThrow(Error);
    expect(() => addWord('hello')).toThrow(Error);
  });

  // TODO: more tests
  test('Game over', () => {
    expect(() => addWord('hello')).not.toThrow(Error);
    for (let i = 0; i < 3; i++) {
      expect(() => addWord('hello')).toThrow(Error);
    }
  });
});

describe('removeWord', () => {
  test('No such word', () => {
    expect(() => removeWord('hello')).toThrow(Error);
  });

  test('Double remove', () => {
    addWord('hello');
    expect(() => removeWord('hello')).not.toThrow(Error);
    expect(() => removeWord('hello')).toThrow(Error);
  });

  // TODO: more tests
  test('Game over', () => {
    addWord('hello');
    expect(() => removeWord('hello')).not.toThrow(Error);
    for (let i = 0; i < 3; i++) {
      expect(() => removeWord('hello')).toThrow(Error);
    }
  });
});

// TODO: your other tests here

describe('getGameInfo', () => {
  test('Initial game info', () => {
    expect(getGameInfo()).toEqual({
      score: 0,
      mistakesRemaining: 3,
      cluesRemaining: 3,
    });
  });

  test('After adding and removing a word', () => {
    addWord('hello');
    expect(getGameInfo()).toEqual({
      score: 1,
      mistakesRemaining: 3,
      cluesRemaining: 3,
    });
    removeWord('hello');
    expect(getGameInfo()).toEqual({
      score: 2,
      mistakesRemaining: 3,
      cluesRemaining: 3,
    });
  });

  test('After one mistake', () => {
    addWord('hello');
    expect(() => addWord('hello')).toThrow(Error);
    expect(getGameInfo()).toEqual({
      score: 1,
      mistakesRemaining: 2,
      cluesRemaining: 3,
    });
  });

  test('After one clue', () => {
    viewDictionary();
    expect(getGameInfo()).toEqual({
      score: 0,
      mistakesRemaining: 3,
      cluesRemaining: 2,
    });
  });
});

describe('viewDictionary', () => {
  test('No more clues', () => {
    for (let i = 0; i < 3; i++) {
      viewDictionary();
    }
    expect(() => viewDictionary()).toThrow(Error);
  });

  test('show dictionary', () => {
    addWord('hello');
    addWord('world');
    expect(viewDictionary()).toEqual(['hello', 'world']);
  });

  test('viewing dictionary after inactive', () => {
    addWord('hello');
    addWord('world');
    for (let i = 0; i < 3; i++) {
      expect(() => addWord('hello')).toThrow(Error);
    }
    viewDictionary();
    expect(viewDictionary()).toEqual(['hello', 'world']);
  });
});

describe('resetGame', () => {
  test('reset game', () => {
    addWord('hello');
    addWord('world');
    resetGame();
    expect(getGameInfo()).toEqual({
      score: 0,
      mistakesRemaining: 3,
      cluesRemaining: 3,
    });
  });
});

describe('saveGame', () => {
  test('Invalid name', () => {
    expect(() => saveGame('')).toThrow(Error);
    expect(() => saveGame(' ')).toThrow(Error);
    expect(() => saveGame('hello world')).toThrow(Error);
    expect(() => saveGame('hello_world')).toThrow(Error);
  });

  test('Overwrite', () => {
    saveGame('test');
    expect(() => saveGame('test')).toThrow(Error);
  });

  test('Save and load', () => {
    addWord('hello');
    saveGame('test');
    resetGame();
    loadGame('test');
    expect(getGameInfo().score).toBe(1);
  });
});

describe('loadGame', () => {
  test('Invalid name', () => {
    expect(() => loadGame('')).toThrow(Error);
    expect(() => loadGame(' ')).toThrow(Error);
    expect(() => loadGame('hello world')).toThrow(Error);
    expect(() => loadGame('hello_world')).toThrow(Error);
  });

  test('No such game', () => {
    expect(() => loadGame('test')).toThrow(Error);
  });

  test('Save and load', () => {
    addWord('hello');
    saveGame('test');
    resetGame();
    loadGame('test');
    expect(getGameInfo().score).toBe(1);
  });
});
