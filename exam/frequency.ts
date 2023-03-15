interface Count {
  [key: string]: number;
}

/**
 * Returns a dictionary containing the number of times a given word appears.
 *
 * @param {string} text - the text to be analyzed
 *
 * @returns {Count}
 */

export function frequency_get(text: string): Count {
  // delete all .?!,;:()[]{}- \n
  const words = text.replaceAll(/[\.\?\!\,\;\:\(\)\[\]\{\}\-\ \n]/g, ' ').split(' ');
  const result: Count = {};
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toUpperCase();
    if (word !== '') {
      if (result[word]) {
        result[word]++;
      } else {
        result[word] = 1;
      }
    }
  }
  // sort the result by value
  return Object.fromEntries(
    Object.entries(result).sort(([, a], [, b]) => b - a)
  );
}
