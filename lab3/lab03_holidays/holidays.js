// TODO: Add more imports here.
import promptSync from 'prompt-sync';
import { getValentinesDay, getEaster,  getChristmas} from 'date-fns-holiday-us';
import { format } from 'date-fns';
/**
 * Given a starting year and an ending year:
 * - If `start` is not at least 325, return an empty array.
 * - If `start` is strictly greater than `end`, return an empty array.
 * - Otherwise, return an array of objects containing information about the valentine,
 * easter and christmas date strings in the given (inclusive) range.
 *
 * An example format for christmas in 1970 is
 * - Friday, 25.12.1970
 *
 * @param {number} start - starting year, inclusive
 * @param {number} end - ending year, inclusive
 * @returns {Array<{valentinesDay: string, easter: string, christmas: string}>}
 */
export function holidaysInRange(start, end) {
  // return [
  //   // Example for start=1970, end=1972
  //   {
  //     valentinesDay: 'Saturday, 14.02.1970',
  //     easter: 'Sunday, 29.03.1970',
  //     christmas: 'Friday, 25.12.1970',
  //   },
  //   {
  //     valentinesDay: 'Sunday, 14.02.1971',
  //     easter: 'Sunday, 11.04.1971',
  //     christmas: 'Saturday, 25.12.1971',
  //   },
  //   {
  //     valentinesDay: 'Monday, 14.02.1972',
  //     easter: 'Sunday, 02.04.1972',
  //     christmas: 'Monday, 25.12.1972',
  //   }
  // ];
  if (start < 325 || start > end) {
    return [];
  }
  let result = [];
  for (let i = start; i <= end; i++) {
    let valentinesDay = getValentinesDay(i);
    let easter = getEaster(i);
    let christmas = getChristmas(i);
    // valentinesDay: 'day, dd.mm.yyyy'
    // easter: 'day, dd.mm.yyyy'
    // christmas: 'day, dd.mm.yyyy'
    result.push({
      valentinesDay: format(valentinesDay, 'EEEE, dd.MM.yyyy'),
      easter: format(easter, 'EEEE, dd.MM.yyyy'),
      christmas: format(christmas, 'EEEE, dd.MM.yyyy'),
    });
  }
  return result;
}

/**
 * TODO: Implement the two lines in the "main" function below.
 * This function is imported and called in main.js
 */
export function main() {
  const prompt = promptSync();
  const start = parseInt(prompt('Enter start year: ')); // FIXME use prompt and parseInt()
  const end =  parseInt(prompt('Enter end year: '));// FIXME use prompt and parseInt()

  const holidays = holidaysInRange(start, end);
  console.log(holidays);
}
