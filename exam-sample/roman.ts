export function roman(numerals: string): number {
  // Create a dictionary of roman numerals
  const romanNumerals: { [key: string]: number } = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };
  // Create a variable to store the total
  let total = 0;
  // Loop through the string
  for (let i = 0; i < numerals.length; i++) {
    // If the current value is less than the next value, subtract it from the total
    if (romanNumerals[numerals[i]] < romanNumerals[numerals[i + 1]]) {
      total -= romanNumerals[numerals[i]];
    } else {
      // Otherwise, add it to the total
      total += romanNumerals[numerals[i]];
    }
  }
  // Return the total
  return total;
}
