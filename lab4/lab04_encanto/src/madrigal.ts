/**
 * Add type annotations to function parameters and replace all type stubs 'any'.
 *
 * Note: All functions in this lab are pure functions (https://en.wikipedia.org/wiki/Pure_function)
 * You should NOT introduce a "dataStore" or use any global variables in this file.
 */

export interface Madrigal {
  // TODO: add type annotations
  name: string;
  age: number;
  gift?: string;
}

export interface Song {
  // TODO: add type annotations
  name: string;
  singers: string | string[];
}

// TODO: remove 'any' and add type annotations
export function createMadrigal(name: string, age: number, gift? : string): Madrigal {
  // TODO: implementation
  if (gift) {
    return { name, age, gift };
  }
  return { name, age };
}

// TODO: remove 'any' and add type annotations
export function createSong(name: string, singers: string | string[]): Song {
  // TODO: implementation
  return {
    name,
    singers
  };
}

// TODO: add type annotations
export function extractNamesMixed(array: (Madrigal | Song)[]) {
  // TODO: implementation
  return array.map((item) => {
    if (item instanceof Object) {
      return item.name;
    }
    return item;
  }
  );
}

// TODO: add type annotations
export function extractNamesPure(array: Madrigal[] | Song[]) {
  // TODO: implementation
  return array.map((item) => item.name);
}

// TODO: add type annotations
export function madrigalIsSinger(madrigal: Madrigal, song: Song) {
  // TODO: implementation
  // Check if the given madrigal is one of the singers in the given song.
  if (typeof song.singers === "string") {
    // if the singer is a string, compare it to the madrigal's name
    // return true if they match，otherwise return false
    return song.singers === madrigal.name;
  }
  // if the singer is an array, check if the madrigal's name is in the array
  // return true if it is, otherwise return false
  return song.singers.includes(madrigal.name);
}

// TODO: add type annotations
export function sortedMadrigals(madrigals: Madrigal[]) {
  // TODO: implementation
  // Sort the given array of madrigals by age in ascending order.
  // If two madrigals have the same age, sort them by name in ascending order.
  return madrigals.sort(
    (a, b) => a.age - b.age || a.name.localeCompare(b.name)
  );
}

// TODO: add type annotations
export function filterSongsWithMadrigals(madrigals: Madrigal[], songs: Song[]) {
  // TODO: implementation
  // Given an array of madrigals and an array of songs, return all songs that contain any of the madrigals as a singer.
  return songs.filter((song) => {
    if (typeof song.singers === "string") {
      return madrigals.some((madrigal) => madrigal.name === song.singers);
    }
    return madrigals.some((madrigal) => song.singers.includes(madrigal.name));
  }
  );
}

// TODO: add type annotations
export function getMostSpecialMadrigal(madrigals: Madrigal[], songs: Song[]) {
  // TODO: implementation
  // Given an array of madrigals and an array of songs, return the madrigal who is the singer of the most songs.
  // sort the madrigals by the number of songs they sang
  // if two madrigals have the same number of songs, sort them by the order they appear in the array
  // return the first madrigal in the sorted array
  return madrigals.map((madrigal) => {
    return {
      madrigal,
      songs: songs.filter((song) => madrigalIsSinger(madrigal, song))
    };
  }
  ).sort((a, b) => b.songs.length - a.songs.length)[0].madrigal;
}
