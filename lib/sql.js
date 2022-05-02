const querySql = {};

querySql.wordsQuery = `
select id, word as w 
from user_vocab;
`;

const addVocab = (newVocab) => `
insert into user_vocab (word) values (${newVocab});
`;
module.exports = { querySql, addVocab };
