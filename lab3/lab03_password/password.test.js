/**
 * @see password
 * @module password.test
 */

import { checkPassword } from './password.js';

test('54321 => Poor Password', () => {
  expect(checkPassword("54321")).toEqual("Poor Password");
});

test('32890583 => Poor Password', () => {
  expect(checkPassword("32890583")).toEqual("Poor Password");
});

test('qwerty => Horrible Password', () => {
  expect(checkPassword("qwerty")).toEqual("Horrible Password");
});

test('123456789 => Horrible Password', () => {
  expect(checkPassword("123456789")).toEqual("Horrible Password");
});

test('password => Horrible Password', () => {
  expect(checkPassword("password")).toEqual("Horrible Password");
});

test('Moa2149212 => Moderate Password', () => {
  expect(checkPassword("Moa2149212")).toEqual("Moderate Password");
});

test('JJCIo908114 => Moderate Password', () => {
  expect(checkPassword("JJCIo908114")).toEqual("Moderate Password");
});

test('MJsdkfa02192014074 => Strong Password', () => {
  expect(checkPassword("MJsdkfa02192014074")).toEqual("Strong Password");
});

test('wo32849652738Mi => Strong Password', () => {
  expect(checkPassword("wo32849652738Mi")).toEqual("Strong Password");
});

test('asijdshauifgh09124u1JIijx => Strong Password', () => {
  expect(checkPassword("asijdshauifgh09124u1JIijx")).toEqual("Strong Password");
});
/*

// You can remove or replace this with your own tests.
// TIP: you may want to explore "test.each"
describe('Example block of tests', () => {
  test('Example test 1', () => {
    expect(checkPassword('something')).toEqual('Poor Password');
  });

  test('Example test 2', () => {
    expect(checkPassword('not a good test')).toEqual('Poor Password');
  });
});

*/
