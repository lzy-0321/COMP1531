/**
 * Tests for the lecture question asking service.
 */
import { submit, like, dismiss, questions, clear } from './questions';

describe('dryrun', () => {
  test('example', () => {
    clear()
    const q1 = submit('How long is a piece of string?')
    const q2 = submit("What's your shoe size?")
    like(q1)
    expect(questions()).toStrictEqual([
      {
        id: q1,
        question: "How long is a piece of string?",
        likes: 1,
      },
      {
        id: q2,
        question: "What's your shoe size?",
        likes: 0,
      },
    ]);
  });
});

// Write your tests here
