/**
 * NOTE: The only functions that you should write tests for are those defined
 * in the specification's interface (README.md). 
 * 
 * Your dataStore or any "helper" function you define should NOT be imported or
 * tested - your tests must work even if it is run against another student's
 * solution to this lab.
 */

import {
  academicCreate,
  courseCreate,
  academicDetails,
  courseDetails,
  academicsList,
  coursesList,
  courseEnrol,
  clear,
} from './academics';

describe('academicCreate test', () => {
  test('error creating academics', () => {
    clear();
    expect(academicCreate('', 'dancing')).toStrictEqual({ error: 'a relevant error message of your choice' });
  });
  test('error creating academics', () => {
    clear();
    expect(academicCreate('Magnus', '')).toStrictEqual({ error: 'a relevant error message of your choice' });
  });
  test('correct creating academics', () => {
    clear();
    expect(academicCreate('Magnus', 'chess')).toStrictEqual(
      {
        academicId: expect.any(Number),
      }
    );
  });
});

describe('courseCreate test', () => {
  test('error creating course', () => {
    clear();
    expect(courseCreate('', 'COMP1531')).toStrictEqual({ error: 'a relevant error message of your choice' });
  });
  
  test('error creating course', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    expect(courseCreate(academic.academicId, '')).toStrictEqual({ error: 'a relevant error message of your choice' });
  });
  test('correct creating course', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    expect(courseCreate(academic.academicId, 'COMP1531')).toStrictEqual(
      {
        courseId: expect.any(Number),
      }
    );
  });
});


describe('academicDetails test', () => {
  test('error getting academic details', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    expect(academicDetails(academic.academicId, 1)).toStrictEqual({ error: 'a relevant error message of your choice' });
  });
  test('error getting academic details', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    expect(academicDetails(1, academic.academicId)).toStrictEqual({ error: 'a relevant error message of your choice' });
  });
  test('correct getting academic details', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    expect(academicDetails(academic.academicId, academic.academicId)).toStrictEqual(
      {
        academic: {
          academicId: expect.any(Number),
          name: 'Magnus',
          hobby: 'chess',
        }
      }
    );
  });
});

describe('courseDetails test', () => {
  test('error getting course details', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    const course = courseCreate(academic.academicId, 'COMP1531');
    expect(courseDetails('', course.courseId)).toStrictEqual({ error: 'a relevant error message of your choice' });
  });
  test('error getting course details', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    const course = courseCreate(academic.academicId, 'COMP1531');
    expect(courseDetails(academic.academicId, '')).toStrictEqual({ error: 'a relevant error message of your choice' });
  });
  test('correct getting course details', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    const course = courseCreate(academic.academicId, 'COMP1531', 'Software Engineering Fundamentals');
    expect(courseDetails(academic.academicId, course.courseId)).toStrictEqual(
      {
        course: {
          courseId: expect.any(Number),
          name: 'COMP1531',
          description: expect.any(String),
          staffMembers: [
            {
              academicId: expect.any(Number),
              name: 'Magnus',
              hobby: 'chess',
            }
          ],
          allMembers: [
            {
              academicId: expect.any(Number),
              name: 'Magnus',
              hobby: 'chess',
            }
          ]
        }
      });
  });
  test('correct getting course details', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    const academic1 = academicCreate('Carlsen', 'drawing');
    const course = courseCreate(academic.academicId, 'COMP1531', 'Software Engineering Fundamentals');
    const courseenrol = courseEnrol(academic1.academicId, course.courseId, true);
    expect(courseDetails(academic1.academicId, course.courseId)).toStrictEqual(
      {
        course: {
          courseId: expect.any(Number),
          name: 'COMP1531',
          description: expect.any(String),
          staffMembers: [
            {
              academicId: expect.any(Number),
              name: 'Magnus',
              hobby: 'chess',
            },
            {
              academicId: expect.any(Number),
              name: 'Carlsen',
              hobby: 'drawing',
            }
          ],
          allMembers: [
            {
              academicId: expect.any(Number),
              name: 'Magnus',
              hobby: 'chess',
            },
            {
              academicId: expect.any(Number),
              name: 'Carlsen',
              hobby: 'drawing',
            }
          ]
        }
      });
  });
});

describe('academicsList test', () => {
  test('error getting academics list', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    expect(academicsList('')).toStrictEqual({ error: 'a relevant error message of your choice' });
  });
  test('correct getting academics list', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    expect(academicsList(academic.academicId)).toStrictEqual(
      {
        academics: [
          {
            academicId: expect.any(Number),
            name: 'Magnus',
          }
        ]
      }
    );
  });
});

describe('coursesList test', () => {
  test('error getting courses list', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    expect(coursesList('')).toStrictEqual({ error: 'a relevant error message of your choice' });
  });
  test('correct getting courses list', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    const course = courseCreate(academic.academicId, 'COMP1531', 'Software Engineering Fundamentals');
    expect(coursesList(academic.academicId)).toStrictEqual(
      {
        courses: [  
          {
            courseId: expect.any(Number),
            name: 'COMP1531',
          }
        ]
      }
    );
  });
  test('correct getting courses list', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    const course = courseCreate(academic.academicId, 'COMP1531', 'Software Engineering Fundamentals');
    const course1 = courseCreate(academic.academicId, 'COMP1521', 'Computer Systems Fundamentals');
    expect(coursesList(academic.academicId)).toStrictEqual(
      {
        courses: [  
          {
            courseId: expect.any(Number),
            name: 'COMP1531',
          },
          {
            courseId: expect.any(Number),
            name: 'COMP1521',
          }
        ]
      }
    );
  });
});

describe('courseEnrol test', () => {
  test('error enrolling course', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    const course = courseCreate(academic.academicId, 'COMP1531', 'Software Engineering Fundamentals');
    expect(courseEnrol('', course.courseId, true)).toStrictEqual({ error: 'a relevant error message of your choice' });
  });
  test('error enrolling course', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    const course = courseCreate(academic.academicId, 'COMP1531', 'Software Engineering Fundamentals');
    expect(courseEnrol(academic.academicId, '', true)).toStrictEqual({ error: 'a relevant error message of your choice' });
  });
  test('error enrolling course', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    const course = courseCreate(academic.academicId, 'COMP1531', 'Software Engineering Fundamentals');
    expect(courseEnrol(academic.academicId, course.courseId, true)).toStrictEqual({ error: 'a relevant error message of your choice' });
  });
  test('error enrolling course', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    const course = courseCreate(academic.academicId, 'COMP1531', 'Software Engineering Fundamentals');
    expect(courseEnrol(academic.academicId, course.courseId, false)).toStrictEqual({ error: 'a relevant error message of your choice' });
  });
  test('correct enrolling course', () => {
    clear();
    const academic = academicCreate('Magnus', 'chess');
    const academic1 = academicCreate('leo', 'drawing');
    const course = courseCreate(academic.academicId, 'COMP1531', 'Software Engineering Fundamentals');
    expect(courseEnrol(academic1.academicId, course.courseId, true)).toStrictEqual({})
  });
});


/*

// FIXME
// This is a sample test that tests many academic functions together
// You may want to break this up into multiple tests.
describe('Sample test', () => {
  test('error creating academics', () => {
    // Each test should be independent of other tests. This can be achieve by
    // clearing and reinitialising the database.
    // You may want to look at Jest's beforeEach and afterEach.
    clear();

    // Empty name
    expect(academicCreate('', 'dancing')).toStrictEqual({ error: expect.any(String) });
  });

  test('correct return type', ()=> {
    // Consider beforeEach
    clear();

    const academic = academicCreate('Magnus', 'chess');

    // NOTE: We don't actually know what the generated ID should be
    expect(academic).toStrictEqual(
      {
        academicId: expect.any(Number),
      }
    );

    // However, we can still use this ID in other functions
    expect(academicDetails(academic.academicId, academic.academicId)).toStrictEqual({
      academic: {
        academicId: academic.academicId,
        name: 'Magnus',
        hobby: 'chess',
      }
    });

    // Note the different key for "name" in this function - refer to "Data Types"
    // When comparing arrays with multiple items, you may want to convert each
    // array into a Set (since we don't know which order the items will be in).
    expect(academicsList(academic.academicId)).toStrictEqual({
      academics: [
        {
          academicId: academic.academicId,
          academicName: 'Magnus',
        }
      ]
    });
  });
});

*/
