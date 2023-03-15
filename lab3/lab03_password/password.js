/**
 * NOTE: Tests for the checkPassword should be written first,
 * before implementing the function below.
 * @module password
 */

/**
 * Checks the strength of the given password and returns a string
 * to represent the result.
 *
 * The returned string (in Title Case) is based on the requirements below:
 * - "Strong Password"
 *     - at least 12 characters long
 *     - at least  1 number
 *     - at least  1 uppercase letter
 *     - at least  1 lowercase letter
 * - "Moderate Password"
 *     - at least  8 characters long
 *     - at least  1 letter (upper or lower case)
 *     - at least  1 number
 * - "Horrible Password"
 *     - passwords is 	123456, 123456789, 	12345, 	qwerty, password
 * - "Poor Password"
 *     - any password that is not horrible, moderate or strong.
 *
 * @param {string} password to check
 * @returns {string} string to indicate the strength of the password.
 */
export function checkPassword(password) {
  // FIXME
  let charactersLong = 0;
  let hasNumber = false;
  let hasUpperCase = false;
  let hasLowerCase = false;

  for (let i = 0; i < password.length; i++) {
    charactersLong++;
    if (password[i] >= "0" && password[i] <= "9") {
      hasNumber = true;
    }
    if (password[i] >= "A" && password[i] <= "Z") {
      hasUpperCase = true;
    }
    if (password[i] >= "a" && password[i] <= "z") {
      hasLowerCase = true;
    }
  }
  if (charactersLong >= 12 && hasNumber == true && hasUpperCase == true && hasLowerCase == true) {
    return "Strong Password";
  }
  else if (charactersLong >= 8 && hasNumber == true && hasUpperCase == true && hasLowerCase == true) {
    return "Moderate Password";
  }
  else if (password == "123456" || password == "123456789" || password == "12345" || password == "qwerty" || password == "password" ) {
    return "Horrible Password";
  }
  else {
    return "Poor Password";
  }
}

/**
 * Testing will no longer be done in here.
 * See password.test.js
 */
