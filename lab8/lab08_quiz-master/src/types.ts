export interface answer {
  isCorrect: boolean;
  answerString: string;
}

export interface question {
  questionId: number;
  questionString: string;
  questionType: string;
  answers: answer[];
}

export interface quiz {
  quizId: number;
  quizTitle: string;
  quizSynopsis: string;
  questions: question[];
}

export interface Data {
  quizzes: quiz[];
  questions: question[];
}
