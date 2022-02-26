const esrever = require('../components/esrever.js')
const reverse = (str) => esrever.reverse(str);

var input = 'Lorem ipsum 𝌆 dolor sit ameͨ͆t.';
reverse(input);
console.log(reverse(input))

const iterations = 300;

console.time('Function #2');
for (let i = 0; i < iterations; i++) {
  const str1 = reverse(input)
}
console.timeEnd('Function #2')



console.time('Function #1');
for (let i = 0; i < iterations; i++) {
  const str2 = input.split('').reverse()
}
console.timeEnd('Function #1')
