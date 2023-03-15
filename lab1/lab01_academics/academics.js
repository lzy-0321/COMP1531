/**
 * The dataStore below will be used in the given console.log debug statements
 * at the bottom of the file.
 * You can modify this if you want to do your own testing.
 *
 * We will be using a modified dataStore in the automarking - see the
 * "Testing" section the specification.
 */
const dataStore = {
  academics: [
    {
      id: 10,
      name: 'Ada',
      hobby: 'music',
    },
    {
      id: 20,
      name: 'Ben',
      hobby: 'gym',
    },
    {
      id: 30,
      name: 'Cid',
      hobby: 'chess',
    },
    {
      id: 40,
      name: 'Dan',
      hobby: 'art',
    },
    {
      id: 50,
      name: 'Eve',
      hobby: 'yoga',
    },
  ],

  courses: [
    {
      id: 1511,
      name: 'COMP1511',
      description: 'Programming Fundamentals',
      staffIds: [10, 20],
      memberIds: [10, 20, 30, 40, 50],
    },
    {
      id: 1521,
      name: 'COMP1521',
      description: 'Computer Systems Fundamentals',
      staffIds: [20],
      memberIds: [20, 40, 50],
    },
    {
      id: 1531,
      name: 'COMP1531',
      description: 'Software Engineering Fundamentals',
      staffIds: [20, 30],
      memberIds: [20, 30, 10, 40],
    },
  ],
};

/**
 * @returns {{numAcademics: number}} object
 */
function getNumAcademics() {
  // TODO: Observe the return object, then replace with your implementation
  // to work on dataStores with a different number of academics and courses.
  
  return {
    numAcademics: dataStore.academics.length,
  };
}

/**
 * @returns {{numCourses: number}}
 */
function getNumCourses() {
  // TODO: Observe the return object, then replace with your implementation
  // to work on dataStores with a different number of academics and courses.
  return {
    numCourses: dataStore.courses.length,
  };
}

/**
 * @param {number} academicId - unique identifier for an academic.
 * @returns {{academic: {name: string, hobby: string}}}
 * @returns {{error: string}} on error
 */
function getAcademicDetailsFromId(academicId) {
  // TODO: Observe the return object, then replace with your implementation
  // to work on dataStores with a different number of academics and courses.
  const index = dataStore.academics.findIndex((academic) => academic.id === academicId);
  if (index === -1) {
    return {
      error: 'any string value',
    };
  }
  return {
    academic: {
      name: dataStore.academics[index].name,
      hobby: dataStore.academics[index].hobby,
    },
  };
}

/**
 * @param {number} courseId - unique identifier for a course.
 * @returns {{course: {name: string, description: string}}}
 * @returns {{error: string}} on error
 */
function getCourseDetailsFromId(courseId) {
  // TODO: Observe the return object, then replace with your implementation
  // to work on dataStores with a different number of academics and courses.
  const index = dataStore.courses.findIndex((courses) => courses.id === courseId);
  if (index === -1) {
    return {
      error: 'any string value',
    };
  }
  return {
    course: {
      name: dataStore.courses[index].name,
      description: dataStore.courses[index].description,
    },
  };
}

/**
 * @param {number} academicId - unique indentifier for an academic
 * @param {number} courseId - unique identifier for a course
 * @returns {{isMember: boolean}}
 * @returns {{error: string}} on error
 */
function checkAcademicIsMember(academicId, courseId) {
  // TODO: Observe the return object, then replace with your implementation
  // to work on dataStores with a different number of academics and courses.
  const indexC = dataStore.courses.findIndex((courses) => courses.id === courseId);
  if (indexC === -1) {
    return {
      isMember: false,
    };
  }
  else {
    const indexA = dataStore.courses[indexC].memberIds.findIndex((member) => member === academicId);
    if (indexA === -1) {
      return {
        isMember: false,
      };
    }
    else {
      return {
        isMember: true,
      };
    }
  }
}

/**
 * @param {number} academicId - unique indentifier for an academic
 * @param {number} courseId - unique identifier for a course
 * @returns {{isStaff: Boolean}}
 * @returns {{error: string}} on error
 */
function checkAcademicIsStaff(academicId, courseId) {
  // TODO: Observe the return object, then replace with your implementation
  // to work on dataStores with a different number of academics and courses.
  const indexC = dataStore.courses.findIndex((courses) => courses.id === courseId);
  if (indexC === -1) {
    return {
      isStaff: false,
    };
  }
  else {
    const indexA = dataStore.courses[indexC].staffIds.findIndex((staff) => staff === academicId);
    if (indexA === -1) {
      return {
        isStaff: false,
      };
    }
    else {
      return {
        isStaff: true,
      };
    }
  }
}

/**
 * You will not be able to compare two objects with `===`. For this week, you
 * can simply console.log() the output and view it manually.
 *
 * NOTE: the output of any console.log statements, e.g. colours/whitespaces
 * does not matter when we mark your code, as we will be assessing the
 * return value of your functions directly.
 */
console.log('1. numAcademics()');
console.log('Expect: { numAcademics: 5 }');
console.log('Output:', getNumAcademics());
console.log();

console.log('2. numCourses()');
console.log('Expect: { numCourses: 3 }');
console.log('Output:', getNumCourses());
console.log();

console.log('3. getAcademicDetailsFromId(10)');
console.log("Expect: { academic: { name: 'Ada', hobby: 'music' } }");
console.log('Output:', getAcademicDetailsFromId(10));
console.log();

console.log('4. getAcademicDetailsFromId(999999)');
console.log("Expect: { error: 'any string value' }");
console.log('Output:', getAcademicDetailsFromId(999999));
console.log();

console.log('5. getCourseDetailsFromId(1521)');
console.log("Expect: { course: {name: 'COMP1521', description: 'Computer Systems Fundamentals' } }");
console.log('Output:', getCourseDetailsFromId(1521));
console.log();

console.log('Output:', checkAcademicIsMember(20, 1521));

console.log('Output:', checkAcademicIsStaff(20, 1521));