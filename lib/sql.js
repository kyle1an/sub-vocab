const checkValidationByUser = (word, username) => `
SELECT is_valid
FROM user_vocab
where word = '${word}'
  and user_id = get_user_id_by_name('${username}');
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
SELECT u.word, u.is_valid, u.is_user
FROM user_vocab u
where u.user_id = get_user_id_by_name('${username}');
`

module.exports.acquaintWordByUser = (newVocab, username) => `
SELECT acquaint_vocab_by_user('${newVocab}', get_user_id_by_name('${username}')) as row_count;
${checkValidationByUser(newVocab, username)}
`

module.exports.revokeWordByUser = (vocab, username) => `
UPDATE user_vocab
SET is_valid = false
WHERE user_id = get_user_id_by_name('${username}')
  and word = '${vocab}';
${checkValidationByUser(vocab, username)}
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
