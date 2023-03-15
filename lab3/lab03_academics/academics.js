/**
 * @module academics
 */

/**
 * Create your dataStore here. The design is entirely up to you!
 * One possible starting point is
 *
 * let/const dataStore = {
 *   academics: [],
 *   courses: []
 * }
 *
 * and adding to the dataStore the necessary information when the
 * "create" functions are used.
 *
 * You will also need to modify the clear function accordingly
 * - we recommend you complete clear() at the bottom first!
 * 
 * Do not export the dataStore. Your tests should not use/rely on
 * how dataStore is structured - only what goes in and out of the
 * defined functions from the interface.
 */

// TODO
  const dataStore = {
    academics: [],
    courses: []
  };

  const ID = {
    academicId: 100000,
    courseId: 1000,
  }
/**
 * Complete the functions from the interface table.
 * As an optional activity, you can document your functions
 * similar to how academicCreate has been done.
 *
 * A reminder to return { error: 'any relevant error message of your choice' }
 * for error cases.
 */

/**
 * Creates a new academic, returning an object containing
 * a unique academic id
 *
 * @param {string} name
 * @param {string} hobby
 * @returns {{academicId: number}}
 */
export function academicCreate(name, hobby) {
  // TODO:
  // if name is empty or hobby is empty, return {error}
  // else, create a new academic object and push it to dataStore.academics
  // return {academicId: id}
  if (name === "" || hobby === "") {
    return {error: 'a relevant error message of your choice'};
  }
  else {
    const newAcademic = {
      academicId: ID.academicId,
      name: name,
      hobby: hobby,
    };
    ID.academicId++;
    dataStore.academics.push(newAcademic);
    return {academicId: newAcademic.academicId};
  }
}

function isCourseName(name) {
  for (let i = 0; i < 4; i++) {
    if (!(name[i] >= 'A' && name[i] <= 'Z')) {
      return false;
    }
  }
  for (let i = 4; i < 8; i++) {
    if (isNaN(parseInt(name[i]))) {
      return false;
    }
  }
  return true;
}

/**
 * Some description
 *
 * @param {number} academicId
 * @param {string} name
 * @param {string} description
 * @returns {{courseId: number}}
 */
export function courseCreate(academicId, name, description) {
  // TODO
  // if academicId is not in dataStore.academics, return {error}
  // if name of the course is not 4 uppercase letters followed by 4 single-digit integers, e.g. "COMP1531", return {error}
  if (isCourseName(name) === false || dataStore.academics.find(academic => academic.academicId === academicId) === undefined) {
    return {error: 'a relevant error message of your choice'};
  }
  else {
    const newCourse = {
      courseId: ID.courseId,
      name: name,
      description: description,
      staffMembers: [
        dataStore.academics[dataStore.academics.findIndex(academic => academic.academicId === academicId)]
      ],
      allMembers: [
        dataStore.academics[dataStore.academics.findIndex(academic => academic.academicId === academicId)]
      ],
    };
    dataStore.courses.push(newCourse);
    ID.courseId++;
    return {courseId: newCourse.courseId};
  }
}

/**
 * Some documentation
 */
export function academicDetails(academicId, academicToViewId) {
  if (dataStore.academics.find(academic => academic.academicId === academicId) === undefined || dataStore.academics.find(academic => academic.academicId === academicToViewId) === undefined) {
    return {error: 'a relevant error message of your choice'};
  }
  else {
    return {
      academic: {
        academicId: academicToViewId,
        name: dataStore.academics[dataStore.academics.findIndex(academic => academic.academicId === academicToViewId)].name,
        hobby: dataStore.academics[dataStore.academics.findIndex(academic => academic.academicId === academicToViewId)].hobby,
      }
    }
  }
}

export function courseDetails(academicId, courseId) {
  // TODO
  // if academicId does not refer to a valid academic, courseId does not refer to a valid course, academicId refers to an academic that is not a member in the course, reutrn {error}
  if (dataStore.academics.find(academic => academic.academicId === academicId) === undefined || dataStore.courses.find(course => course.courseId === courseId) === undefined || dataStore.courses[dataStore.courses.findIndex(course => course.courseId === courseId)].allMembers.find(academic => academic.academicId === academicId) === undefined) {
    return {error: 'a relevant error message of your choice'};
  }
  else {
    return {
      course: {
        courseId: courseId,
        name: dataStore.courses[dataStore.courses.findIndex(course => course.courseId === courseId)].name,
        description: dataStore.courses[dataStore.courses.findIndex(course => course.courseId === courseId)].description,
        staffMembers: dataStore.courses[dataStore.courses.findIndex(course => course.courseId === courseId)].staffMembers,
        allMembers: dataStore.courses[dataStore.courses.findIndex(course => course.courseId === courseId)].allMembers,
      }
    }
  }
}

export function academicsList(academicId) {
  // TODO
  if (dataStore.academics.find(academic => academic.academicId === academicId) === undefined ) {
    return {error: 'a relevant error message of your choice'};
  }
  else {
    const academicsList = [];
    for (const academic of dataStore.academics) {
      academicsList.push({
        academicId: academic.academicId,
        name: academic.name,
      });
    }
    return {academics: academicsList};
  }
}

export function coursesList(academicId) {
  // TODO
  if (dataStore.academics.find(academic => academic.academicId === academicId) === undefined) {
    return {error: 'a relevant error message of your choice'};
  }
  else {
    const coursesList = [];
    for (const course of dataStore.courses) {
      if (course.allMembers.find(academic => academic.academicId === academicId) !== undefined) {
        coursesList.push({
          courseId: course.courseId,
          name: course.name,
        });
      }
    }
    return {courses: coursesList};
  }
}

export function courseEnrol(academicId, courseId, isStaff) {
  if (dataStore.academics.find(academic => academic.academicId === academicId) === undefined || 
      dataStore.courses.find(course => course.courseId === courseId) === undefined || 
      (isStaff == true && dataStore.courses[dataStore.courses.findIndex(course => course.courseId === courseId)].staffMembers.find(academic => academic.academicId === academicId) !== undefined) ||
      dataStore.courses[dataStore.courses.findIndex(course => course.courseId === courseId)].allMembers.find(academic => academic.academicId === academicId) !== undefined) {
    return {error: 'a relevant error message of your choice'};
  }
  else if (isStaff == true) {
    dataStore.courses[dataStore.courses.findIndex(course => course.courseId === courseId)].staffMembers.push(dataStore.academics[dataStore.academics.findIndex(academic => academic.academicId === academicId)]);
    return {};
  }
}

export function clear() {
  // TODO
  dataStore.academics = [];
  dataStore.courses = [];
  ID.academicId = 100000;
  ID.courseId = 1000;
  return {};
}


// const academic = academicCreate('Magnus', 'chess');
// const academic1 = academicCreate('Magn', 'che');
// // console.log(academic.academicId);
// // console.log(dataStore.academics);
// const course = courseCreate(academic.academicId, 'COMP1531', 'Software Engineering Fundamentals');
// const academicId = academic.academicId;
// console.log(dataStore.academics[dataStore.academics.findIndex(academic => academic.academicId === academicId)]);
// console.log(dataStore.courses);
// console.log(course);
// console.log(courseDetails(academic.academicId,course.courseId));