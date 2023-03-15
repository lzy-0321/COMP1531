import fs from 'fs';

export type Turtles = {
  [turtle: string]: {
    age: number;
    color: string[];
  };
};

export function read_json(fileName: string): Turtles {
  return JSON.parse(fs.readFileSync(fileName, 'utf8'));
}

export function count_green(turtles: Turtles): number {
  let result = 0;
  for (const turtle in turtles) {
    if (turtles[turtle].color.includes('green')) {
      result++;
    }
  }
  return result;
}

function main() {
  const turtles = read_json('turtles.json');
  console.log(count_green(turtles));
}

main();
