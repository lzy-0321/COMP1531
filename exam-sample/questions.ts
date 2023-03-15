/**
 * The backend for the lecture question asking application.
 * Each question is assigned an ID number when it is submitted to the app. This ID
 * can then be used to like and dismiss the question. The numbers are always
 * positive, but otherwise follow no defined ordering or structure. Questions have
 * the same ID from when they are submitted till they are dismissed.
 * When questions are first submitted, they have 0 likes.
 */

// Put any global variables your implementation needs here
interface Question {
  id: number;
  question: string;
  likes: number;
}

interface date {
  questions: Question[];
}

let date: date = {
  questions: [],
};

let id = {
  Qid: 0 as number,
}
/**
 * Submits a question to the service.
 * Returns the ID of the question but throws an `Error` if question is an
 * empty string or exceeds 280 characters in length.
 */
export function submit(question: string): number {
  if (question.length === 0) {
    throw new Error('Question cannot be empty');
  }
  if (question.length > 280) {
    throw new Error('Question cannot exceed 280 characters');
  }
  date.questions.push({ id: id.Qid, question: question, likes: 0 });
  id.Qid++;
  return id.Qid - 1;
}

/**
 * Returns a list of all the questions.
 * Each question is represented as an object of `Question`.
 * The list is in order of likes, with the most liked questions first. When
 * questions have the same number of "likes", their order is not defined.
 * 
 * Hint: For this question, there are still marks available if the returned
 * list is in the wrong order, so do not focus on that initially.
 */
export function questions(): Question[] {
  return date.questions.sort((a, b) => b.likes - a.likes);
}

/**
 * Removes all questions from the service.
 */
export function clear() {
  date.questions = [];
}

/**
 * Adds one "like" to the question with the given id.
 * It does not return anything but throws an `Error` if id is not a valid question ID.
 */
export function like(id: number) {
  const question = date.questions.find((question) => question.id === id);
  if (question === undefined) {
    throw new Error('Invalid question ID');
  }
  question.likes++;
  return {};
}

/**
 * Removes the question from the set of questions being stored.
 * It does not return anything but throws an `Error` if id is not a valid
 * question ID.
 */
export function dismiss(id: number) {
  const question = date.questions.find((question) => question.id === id);
  if (question === undefined) {
    throw new Error('Invalid question ID');
  }
  date.questions = date.questions.filter((question) => question.id !== id);
  return {};
}
