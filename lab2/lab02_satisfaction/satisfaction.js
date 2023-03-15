/**
 * Given an array of fast food restaurants, return a new sorted
 * array in descending order by:
 *
 *   1. customerService
 *   2. foodVariety
 *   3. valueForMoney
 *   4. timeToMake
 *   5. taste
 *   6. name (in lexicographical order, case-insensitive)
 *
 * For example, if two restaurant have the same customerService
 * and foodVariety, the one with a higher valueForMoney will be
 * in front (nearer to the start of the returned array).
 *
 * If the all other fields are equal and the name is compared,
 * "hungry Jacks" will be before "KFC" because "h" is before "K".
 *
 * WARNING: You should NOT modify the order of the original array.
 *
 * @param {
 *   Array<{
 *      name: string,
 *      customerService: number,
 *      foodVariety: number,
 *      valueForMoney: number,
 *      timeToMake: number,
 *      taste: number
 *   }>
 * } fastFoodArray with information about fast food restaurants,
 * which should not be modified.
 * @returns array with the same items, sorted by the key-order given.
 */
function sortedFastFood(fastFoodArray) {
  // TODO: Observe the return type from the stub code
  // FIXME: Replace the stub code with your implementation
  let sorted = [];
  sorted = fastFoodArray.sort((a, b) => {
    if (a.customerService > b.customerService) {
      return -1;
    } else if (a.customerService < b.customerService) {
      return 1;
    } else {
      if (a.foodVariety > b.foodVariety) {
        return -1;
      } else if (a.foodVariety < b.foodVariety) {
        return 1;
      } else {
        if (a.valueForMoney > b.valueForMoney) {
          return -1;
        } else if (a.valueForMoney < b.valueForMoney) {
          return 1;
        } else {
          if (a.timeToMake > b.timeToMake) {
            return -1;
          } else if (a.timeToMake < b.timeToMake) {
            return 1;
          } else {
            if (a.taste > b.taste) {
              return -1;
            } else if (a.taste < b.taste) {
              return 1;
            } else {
              if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1;
              } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1;
              } else {
                return 0;
              }
            }
          }
        }
      }
    }
  });
  return sorted;
}

/**
 * Given an array of fast food restaurants, return a new sorted
 * array ranked by the overall satisfaction.
 *
 * The satisfaction of a restaurant is the average score between
 * customerService, foodVariety, valueForMoney, timeToMake and taste.
 *
 * You do not need to round the satisfaction value.
 *
 * If two restaurants have the same satisfaction, the names
 * are compared in lexigraphical order (case-insensitive).
 * For example, "hungry Jacks" will appear before "KFC" because
 * "h" is before "K".
 *
 * WARNING: you should NOT modify the order of the original array.
 *
 * @param {
 *   Array<{
 *     name: string,
 *     customerService: number,
 *     foodVariety: number,
 *     valueForMoney: number,
 *     timeToMake: number,
 *     taste: number
 *  }>
 * } fastFoodArray with information about fast food restaurants,
 * which should not be modified.
 * @returns {
 *   Array<{
 *     restaurantName: string,
 *     satisfaction: number,
 *   }>
 * } a new sorted array based on satisfaction. The restaurantName
 * will be the same as the original name given.
 */
function sortedSatisfaction(fastFoodArray) {
  // TODO: Observe the return type from the stub code
  // FIXME: Replace the stub code with your implementation
  let sorted = [];
  sorted = fastFoodArray.sort((a, b) => {
    let satA = (a.customerService + a.foodVariety + a.valueForMoney + a.timeToMake + a.taste) / 5;
    let satB = (b.customerService + b.foodVariety + b.valueForMoney + b.timeToMake + b.taste) / 5;
    if (satA > satB) {
      return -1;
    } else if (satA < satB) {
      return 1;
    }
    else {
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      } else {
        return 0;
      }
    }
  });
  // return restaurantName
  let result = [];
  for (let i = 0; i < sorted.length; i++) {
    let obj = {};
    obj.restaurantName = sorted[i].name;
    obj.satisfaction = (sorted[i].customerService + sorted[i].foodVariety + sorted[i].valueForMoney + sorted[i].timeToMake + sorted[i].taste) / 5;
    result.push(obj);
  }
  return result;
}

// ========================================================================= //

/**
 * Execute the file with:
 *     $ node satisfaction.js
 *
 * Feel free to modify the below to test your functions.
 */
const fastFoods = [
  {
    name: 'Second fastFood, third satisfaction (4.6)',
    customerService: 5,
    foodVariety: 5,
    valueForMoney: 5,
    timeToMake: 4,
    taste: 4,
  },
  {
    // Same as above, but name starts with "f"
    // which is before "S" (case-insensitive)
    name: 'First fastFood, second satisfaction (4.6)',
    customerService: 5,
    foodVariety: 5,
    valueForMoney: 5,
    timeToMake: 4,
    taste: 4
  },
  {
    // Worse foodVariety, but better overall
    name: 'Third fastFood, first satisfaction (4.8)',
    customerService: 5,
    foodVariety: 4,
    valueForMoney: 5,
    timeToMake: 5,
    taste: 5
  },
];

// Note: We are using console.log because arrays cannot be commpared with ===.
// There are better ways to test which we will explore in future weeks :).
console.log('========================');
console.log('1. Testing Fast Food');
console.log('===========');
console.log(sortedFastFood(fastFoods));
console.log();

console.log('========================');
console.log('2. Testing Satisfaction');
console.log('===========');
console.log(sortedSatisfaction(fastFoods));
console.log();
