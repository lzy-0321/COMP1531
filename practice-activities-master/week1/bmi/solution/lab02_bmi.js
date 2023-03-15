const input = require('prompt-sync')();
const weight = input('What is your weight in kg? ');
const height = input('What is your height in m? ');
const bmi = weight / (height * height);
console.log('Your BMI is: ' + bmi.toFixed(1));
