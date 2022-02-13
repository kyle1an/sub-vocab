import {stemmer} from 'stemmer'


// var natural = require('natural');
// natural.LancasterStemmer.attach();
// natural.PorterStemmer.attach();
// console.log("i am waking up to the sounds of chainsaws".tokenizeAndStem());
// console.log("chainsaws".stem());
//

stemmer('considerations') // => 'consider'
stemmer('detestable') // => 'detest'
console.log(stemmer('happily'))// => 'vile'

var natural = require('natural');
natural.PorterStemmer.attach();
console.log(natural.PorterStemmer.stem("I can see that we are going to be friends").tokenizeAndStem())
// console.log("I can see that we are going to be friends".tokenizeAndStem());
