import HTTPError from 'http-errors';
import { answer, question, quiz } from './types';
import { data, Id } from './datas';

// help function
const getQuiz = (quizId: number) => { return data.quizzes.find(quiz => quiz.quizId === quizId); };
const getQuestion = (questionId: number) => { return data.questions.find((question) => question.questionId === questionId); };

function newQuizId() {
  const id = Id.quizId;
  Id.quizId += 1;
  return id;
}

function newQuestionId() {
  const id = Id.questionId;
  Id.questionId += 1;
  return id;
}

// updata question in quiz
// if question in question list has same id with question in quiz, update it
// else add question to quiz
function updateQuestionInQuiz(quizId: number, question: question) {
  const quiz = getQuiz(quizId);
  const index = quiz.questions.findIndex((q) => q.questionId === question.questionId);
  quiz.questions[index] = question;
}

export function quizCreate(quizTitle: string, quizSynopsis: string) {
  if (quizTitle === '' || quizSynopsis === '') {
    throw HTTPError(400, 'Quiz title and synopsis cannot be empty!');
  }
  const id = newQuizId();
  const newQuiz: quiz = {
    quizId: id,
    quizTitle: quizTitle,
    quizSynopsis: quizSynopsis,
    questions: [],
  };
  data.quizzes.push(newQuiz);
  return { quizId: id };
}

export function quizDetails(quizId: number) {
  const quiz = getQuiz(quizId);
  if (quiz === undefined) {
    throw HTTPError(400, 'Quiz not found!');
  }
  // get all questionId in quiz
  const questionIds = quiz.questions.map((question) => question.questionId);
  // get all question in question list
  const questions = data.questions.filter((question) => questionIds.includes(question.questionId));
  const result: quiz = {
    ...quiz,
    questions,
  };
  return { quiz: result };
}

export function quizEdit(quizId: number, quizTitle: string, quizSynopsis: string) {
  const quiz = getQuiz(quizId);
  if (quiz === undefined) {
    throw HTTPError(400, 'Quiz not found!');
  }
  if (quizTitle === '' || quizSynopsis === '') {
    throw HTTPError(400, 'Quiz title and synopsis cannot be empty!');
  }
  quiz.quizTitle = quizTitle;
  quiz.quizSynopsis = quizSynopsis;
  return {};
}

export function quizRemove(quizId: number) {
  const quiz = getQuiz(quizId);
  if (quiz === undefined) {
    throw HTTPError(400, 'Quiz not found!');
  }
  const index = data.quizzes.indexOf(quiz);
  data.quizzes.splice(index, 1);
  return {};
}

export function quizzesList() {
  const quizzes = data.quizzes;
  quizzes.sort((a, b) => {
    return a.quizId - b.quizId;
  });
  const result = quizzes.map(quiz => {
    return {
      quizId: quiz.quizId,
      quizTitle: quiz.quizTitle,
    };
  });
  return { quizzes: result };
}

export function questionAdd(quizId: number, questionString: string, questionType: string, answers: answer[]) {
  const quiz = getQuiz(quizId);
  const correctAnswers = answers.filter(answer => answer.isCorrect === true).length;
  if (quiz === undefined) {
    throw HTTPError(400, 'Quiz not found!');
  }
  if (questionString === '' || answers.length === 0) {
    throw HTTPError(400, 'Question string and answers cannot be empty!');
  }
  if (questionType !== 'multiple' && questionType !== 'single') {
    throw HTTPError(400, 'Question type must be "multiple" or "single"!');
  }
  if (questionType === 'single' && correctAnswers !== 1) {
    throw HTTPError(400, 'Single choice question must have one correct answer!');
  }
  if (correctAnswers === 0) {
    throw HTTPError(400, 'Question must have at least one correct answer!');
  }
  if (answers.some(answer => answer.answerString === '')) {
    throw HTTPError(400, 'Answer string cannot be empty!');
  }
  const id = newQuestionId();
  const question: question = {
    questionId: id,
    questionString: questionString,
    questionType: questionType,
    answers: answers,
  };
  quiz.questions.push(question);
  data.questions.push(question);
  return { questionId: id };
}

export function questionEdit(questionId: number, questionString: string, questionType: string, answers: answer[]) {
  const question = getQuestion(questionId);
  const correctAnswers = answers.filter(answer => answer.isCorrect === true).length;
  if (question === undefined) {
    throw HTTPError(400, 'Question not found!');
  }
  if (questionString === '' || answers.length === 0) {
    throw HTTPError(400, 'Question string and answers cannot be empty!');
  }
  if (questionType !== 'multiple' && questionType !== 'single') {
    throw HTTPError(400, 'Question type must be "multiple" or "single"!');
  }
  if (questionType === 'single' && correctAnswers !== 1) {
    throw HTTPError(400, 'Single choice question must have one correct answer!');
  }
  if (correctAnswers === 0) {
    throw HTTPError(400, 'Question must have at least one correct answer!');
  }
  if (answers.some(answer => answer.answerString === '')) {
    throw HTTPError(400, 'Answer string cannot be empty!');
  }
  question.questionString = questionString;
  question.questionType = questionType;
  question.answers = answers;
  const quiz = data.quizzes.find(quiz => quiz.questions.some(question => question.questionId === questionId));
  updateQuestionInQuiz(quiz.quizId, question);
  return {};
}

export function questionRemove(questionId: number) {
  const question = getQuestion(questionId);
  if (question === undefined) {
    throw HTTPError(400, 'Question not found!');
  }
  const index = data.questions.indexOf(question);
  data.questions.splice(index, 1);
  return {};
}

export function clear() {
  data.quizzes = [];
  data.questions = [];
  Id.quizId = 0;
  Id.questionId = 0;
  return {};
}
