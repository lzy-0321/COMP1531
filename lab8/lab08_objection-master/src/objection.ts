export enum Objection {
  /**
  * By default, enum are integers 0, 1, 2, ...
  * However, we can also give them string values
  */
  ARGUMENTATIVE = 'argumentative',
  COMPOUND = 'compound',
  HEARSAY = 'hearsay',
  LEADING = 'leading',
  NON_RESPONSIVE = 'non-responsive',
  RELEVANCE = 'relevance',
  SPECULATION = 'speculation',
}

export enum ExaminationType {
  /**
    * It is also possible to specify a "start" number.
    *
    * Below would assign CROSS = 1, DIRECT = 2, the next
    * would be 3, etc.
    */
  CROSS = 1,
  DIRECT,
}

// Helper function - feel free to remove / modify.
function isArgumentative(question: string) {
  return !question.endsWith('?');
}

function isCompound(question: string) {
  let count = 0;
  for (let i = 0; i < question.length; i++) {
    if (question[i] === '?') {
      count++;
    }
  }
  return count > 1;
}

function isHearsay(testimony: string) {
  if (testimony.includes('heard from') || testimony.includes('told me')) {
    return true;
  }
  return false;
}

function isLeading(question: string) {
  if (question.startsWith('why did you') || question.startsWith('do you agree') || question.endsWith('right?') || question.endsWith('correct?')) {
    return true;
  }
  return false;
}

function isNonResponsive(question: string, testimony: string) {
  const questionWord = question.replace(/[^a-zA-Z0-9 ]/g, '');
  const testimonyWord = testimony.replace(/[^a-zA-Z0-9 ]/g, '');
  const questionArray = questionWord.split(' ');
  const testimonyArray = testimonyWord.split(' ');
  return !testimonyArray.some((word) => questionArray.includes(word));
}

function isRelevance(question: string, testimony: string) {
  return testimony.length > question.length * 2;
}

function isSpeculation(question: string, testimony: string, type: ExaminationType) {
  if (type === ExaminationType.DIRECT) {
    return testimony.includes('think');
  }
  return question.includes('think');
}

/**
 * Feel free to modify the function below as you see fit,
 * so long as you satisfy the specification.
 */
export function getObjections(
  question: string,
  testimony: string,
  examinationType: ExaminationType
): Set<Objection> {
  // TODO: error handling
  if (question === '' || testimony === '') {
    throw new Error('Question and testimony must not be empty');
  }
  // Convert given question and testimony to lowercase
  question = question.toLowerCase();
  testimony = testimony.toLowerCase();

  const objections = new Set<Objection>();

  if (examinationType === ExaminationType.CROSS) {
    if (isArgumentative(question)) {
      objections.add(Objection.ARGUMENTATIVE);
    }
  } else {
    if (isLeading(question)) {
      objections.add(Objection.LEADING);
    }
  }
  if (isCompound(question)) {
    objections.add(Objection.COMPOUND);
  }
  if (isHearsay(testimony)) {
    objections.add(Objection.HEARSAY);
  }
  if (isNonResponsive(question, testimony)) {
    objections.add(Objection.NON_RESPONSIVE);
  }
  if (isRelevance(question, testimony)) {
    objections.add(Objection.RELEVANCE);
  }
  if (isSpeculation(question, testimony, examinationType)) {
    objections.add(Objection.SPECULATION);
  }
  return objections;
}
