export function longest_distance(elements: number[]): number {
  let result = 0;
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      if (elements[i] === elements[j]) {
        result = Math.max(result, j - i);
      }
    }
  }
  return result;
}
