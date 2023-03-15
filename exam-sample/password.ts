type Strength = 'Strong Password' |
                'Moderate Password' |
                'Horrible Password' |
                'Poor Password';

/**
 * Checks the strength of the given password and returns a string
 * to represent the result.
 *
 * The returned string is based on the requirements below:
 * - "Strong Password"
 *     - at least 12 characters
 *     - at least  1 number
 *     - at least  1 uppercase letter
 *     - at least  1 lowercase letter
 * - "Moderate Password"
 *     - at least  8 characters
 *     - at least  1 number
 * - "Horrible Password"
 *     - passwords that are exactly any of the top 5 (not 20) passwords
 *     from the 2021 Nordpass Ranking:
 *     - https://en.wikipedia.org/wiki/List_of_the_most_common_passwords
 * - "Poor Password"
 *     - any password that is not horrible, moderate or strong.
 */
export function checkPassword(password: string): Strength {
  if (password.length >= 12 && /[0-9]/.test(password) && /[A-Z]/.test(password) && /[a-z]/.test(password)) {
    return 'Strong Password';
  }
  if (password.length >= 8 && /[0-9]/.test(password)) {
    return 'Moderate Password';
  }
  if (['123456', '123456789', 'qwerty', 'password', '111111'].includes(password)) {
    return 'Horrible Password';
  }
  return 'Poor Password';
}
