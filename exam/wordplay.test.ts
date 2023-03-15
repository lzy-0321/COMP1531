import { wordplay_create, wordplay_guess } from './wordplay';

describe('dryrun', () => {
  test('example', () => {
    const wordplay = wordplay_create('ZOO');
    expect(wordplay).toStrictEqual({ word: 'ZOO', progress: '***', mistakes: 0 });

    expect(wordplay_guess(wordplay, 'Z')).toStrictEqual('Z**');
    expect(wordplay).toStrictEqual({ word: 'ZOO', progress: 'Z**', mistakes: 0 });

    expect(wordplay_guess(wordplay, 'A')).toStrictEqual('Z**');
    expect(wordplay).toStrictEqual({ word: 'ZOO', progress: 'Z**', mistakes: 1 });

    expect(wordplay_guess(wordplay, 'O')).toStrictEqual('VICTORY');
    expect(wordplay).toStrictEqual({ word: 'ZOO', progress: 'ZOO', mistakes: 1 });
  });

  test('invalid word', () => {
    expect(() => wordplay_create('')).toThrow('Word must not be empty');
    expect(() => wordplay_create('zoo')).toThrow('INVALID WORD');
    expect(() => wordplay_create('ZOO1')).toThrow('INVALID WORD');
    expect(() => wordplay_create('I love CSESoc Compclub!')).toThrow('INVALID WORD');
  });

  test('GAME OVER', () => {
    const wordplay = wordplay_create('ZOO');
    expect(wordplay_guess(wordplay, 'A')).toStrictEqual('***');
    expect(wordplay_guess(wordplay, 'B')).toStrictEqual('***');
    expect(wordplay_guess(wordplay, 'C')).toStrictEqual('***');
    expect(wordplay).toStrictEqual({ word: 'ZOO', progress: '***', mistakes: 3 });
    expect(wordplay_guess(wordplay, 'D')).toStrictEqual('GAME OVER');
  });
});
