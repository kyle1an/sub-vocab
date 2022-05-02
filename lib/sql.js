module.exports.addVocab = (newVocab) => `
insert into user_vocab (word) values ('${newVocab}');
`;

module.exports.wordsQuery = `
select c.id, c.word as w, c.is_valid, c.is_user
from common_vocab c
where is_valid = true
UNION
select u.id, LOWER(u.word), u.is_valid, u.is_user
from user_vocab u
where is_valid = true;
`;
