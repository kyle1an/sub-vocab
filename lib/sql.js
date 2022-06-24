const checkValidation = (word) => `
SELECT is_valid
FROM user_vocab
where word = '${word}';
`

module.exports.wordsQuery = `
SELECT c.word as w, c.is_valid, c.is_user
FROM common_vocab c
UNION
SELECT u.word, u.is_valid, u.is_user
FROM user_vocab u;
`;

module.exports.acquaint = (newVocab) => {
  return `
SELECT Acquaint ('${newVocab}') as row_count;
${checkValidation(newVocab)}
`
}

module.exports.acquaintWordByUser = (newVocab, user) => {
  return `
CALL acquaint_word_by_user(get_table_by_username('${user}'), '${newVocab}');
${checkValidation(newVocab)}
`
}

module.exports.revokeWord = (vocab) => {
  return `
UPDATE user_vocab SET is_valid = false WHERE word = '${vocab}';
${checkValidation(vocab)}
`
}

module.exports.revokeWordByUser = (newWord, user) => {
  return `
CALL revoke_word(get_table_by_username('${user}'), '${newWord}');
`
}

module.exports.login = ({ username, password }) => {
  return `
select IDENTITY
from users
where username = '${username}'
  and password = '${password}'
`
}
