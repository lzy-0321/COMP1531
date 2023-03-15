import { getObjections, Objection, ExaminationType } from './objection';

describe('argumentative cases', () => {
  test.each([
    {
      question: 'You are totally lying!',
      testimony: 'No you!',
      type: ExaminationType.CROSS,
      objections: new Set([Objection.ARGUMENTATIVE]),
    },
    {
      question: 'This is direct, yes!',
      testimony: 'Yes, so not argumentative!',
      type: ExaminationType.DIRECT,
      objections: new Set([]),
    },
  ])('$objections', ({ question, testimony, type, objections }) => {
    expect(getObjections(question, testimony, type)).toEqual(objections);
  });
});

describe('leading cases', () => {
  test.each([
    {
      question: 'Are you lying?',
      testimony: 'Yes you',
      type: ExaminationType.CROSS,
      objections: new Set([]),
    },
    {
      question: 'Why did you do that?',
      testimony: 'Because I want to that',
      type: ExaminationType.DIRECT,
      objections: new Set([Objection.LEADING]),
    },
    {
      question: 'Do you agree with me?',
      testimony: 'Yes you',
      type: ExaminationType.DIRECT,
      objections: new Set([Objection.LEADING]),
    },
    {
      question: 'Is that right?',
      testimony: 'Yes, is it',
      type: ExaminationType.DIRECT,
      objections: new Set([Objection.LEADING]),
    },
    {
      question: 'Is that correct?',
      testimony: 'Yes, is it',
      type: ExaminationType.DIRECT,
      objections: new Set([Objection.LEADING]),
    },
  ])('$objections', ({ question, testimony, type, objections }) => {
    expect(getObjections(question, testimony, type)).toEqual(objections);
  });
});

describe('Compound cases', () => {
  test.each([
    {
      question: 'What? Why you did that?',
      testimony: 'Because I want to that',
      type: ExaminationType.CROSS,
      objections: new Set([Objection.COMPOUND]),
    },
    {
      question: 'What? Why you did that?',
      testimony: 'Because I want to that',
      type: ExaminationType.DIRECT,
      objections: new Set([Objection.COMPOUND]),
    },
    {
      question: 'What?',
      testimony: 'What what',
      type: ExaminationType.CROSS,
      objections: new Set([]),
    },
    {
      question: 'What?',
      testimony: 'What what',
      type: ExaminationType.DIRECT,
      objections: new Set([]),
    },
  ])('$objections', ({ question, testimony, type, objections }) => {
    expect(getObjections(question, testimony, type)).toEqual(objections);
  });
});

describe('hearsay cases', () => {
  test.each([
    {
      question: 'Why you do that?',
      testimony: 'I heard from you',
      type: ExaminationType.CROSS,
      objections: new Set([Objection.HEARSAY]),
    },
    {
      question: 'Why you do that?',
      testimony: 'I heard from you',
      type: ExaminationType.DIRECT,
      objections: new Set([Objection.HEARSAY]),
    },
    {
      question: 'Why you do that?',
      testimony: 'You told me',
      type: ExaminationType.CROSS,
      objections: new Set([Objection.HEARSAY]),
    },
    {
      question: 'Why you do that?',
      testimony: 'You told me',
      type: ExaminationType.DIRECT,
      objections: new Set([Objection.HEARSAY]),
    },
    {
      question: 'Why you do that?',
      testimony: 'I heard  from you',
      type: ExaminationType.CROSS,
      objections: new Set([]),
    },
  ])('$objections', ({ question, testimony, type, objections }) => {
    expect(getObjections(question, testimony, type)).toEqual(objections);
  });
});

describe('non-responsive cases', () => {
  test.each([
    {
      question: 'Why you do that?',
      testimony: 'I did',
      type: ExaminationType.CROSS,
      objections: new Set([Objection.NON_RESPONSIVE]),
    },
    {
      question: 'Why you do that?',
      testimony: 'I did',
      type: ExaminationType.DIRECT,
      objections: new Set([Objection.NON_RESPONSIVE]),
    },
    {
      question: 'Why you do that?',
      testimony: 'I do',
      type: ExaminationType.CROSS,
      objections: new Set([]),
    },
  ])('$objections', ({ question, testimony, type, objections }) => {
    expect(getObjections(question, testimony, type)).toEqual(objections);
  });
});

describe('relevance cases', () => {
  test.each([
    {
      question: 'You are totally lying?',
      testimony: 'You are totally lying! You are totally lying!',
      type: ExaminationType.CROSS,
      objections: new Set([Objection.RELEVANCE]),
    },
    {
      question: 'You are totally lying?',
      testimony: 'You are totally lying! You are totally lying',
      type: ExaminationType.CROSS,
      objections: new Set([]),
    },
  ])('$objections', ({ question, testimony, type, objections }) => {
    expect(getObjections(question, testimony, type)).toEqual(objections);
  });
});

describe('speculation case', () => {
  test.each([
    {
      question: 'What do you think?',
      testimony: 'you are lying',
      type: ExaminationType.CROSS,
      objections: new Set([Objection.SPECULATION]),
    },
    {
      question: 'What are you doing?',
      testimony: 'I think you are lying',
      type: ExaminationType.DIRECT,
      objections: new Set([Objection.SPECULATION]),
    },
    {
      question: 'What are you doing?',
      testimony: 'you are lying',
      type: ExaminationType.CROSS,
      objections: new Set([]),
    },
  ])('$objections', ({ question, testimony, type, objections }) => {
    expect(getObjections(question, testimony, type)).toEqual(objections);
  });
});

describe('error cases', () => {
  test('should throw error if question is empty', () => {
    expect(() => getObjections('', 'you are lying', ExaminationType.CROSS)).toThrow(Error);
  });
  test('should throw error if testimony is empty', () => {
    expect(() => getObjections('What are you doing?', '', ExaminationType.CROSS)).toThrow(Error);
  });
});
