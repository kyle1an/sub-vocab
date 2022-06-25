const checkValidityByUser = (word, username) => `
select check_validity(get_vocab_id('${word}'), get_user_id_by_name('${username}')) as is_valid;
`

module.exports.wordsQuery = `
SELECT c.word as w, c.is_valid, c.is_user
FROM common_vocab c
UNION
SELECT u.word, u.is_valid, u.is_user
FROM user_vocab u;
`;

module.exports.userWordsQuery = (username) => `
SELECT c.word as w, c.is_valid, c.is_user
FROM common_vocab c
UNION
select ls.word, r.acquainted as is_valid, ls.is_user
from vocabulary_list ls
         LEFT JOIN user_vocab_record r ON r.vocab_id = ls.id and user_id = get_user_id_by_name('${username}')
where ls.is_valid = true
`

module.exports.acquaintWordByUser = (newVocab, username) => `
select acquaint_record(get_vocab_id('${newVocab}'), get_user_id_by_name('${username}')) as row_count;
${checkValidityByUser(newVocab, username)}
`

module.exports.revokeWordByUser = (vocab, username) => `
select revoke_record(get_vocab_id('${vocab}'), get_user_id_by_name('${username}')) as row_count;
${checkValidityByUser(vocab, username)}
`

module.exports.login = ({ username, password }) => `
select IDENTITY
from users
where username = '${username}'
  and password = '${password}'
`

module.exports.register = ({ username, password }) => `
SELECT register('${username}', '${password}') as result;
`
