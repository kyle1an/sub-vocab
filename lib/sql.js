const checkValidityByUser = (word, username) => `
select check_word_validity_for_user(get_vocab_id('${word}'), get_user_id_by_name('${username}')) as acquainted;
`

module.exports.userWordsQuery = (username) => `
CALL words_of_user(get_user_id_by_name('${username}'));
`

module.exports.acquaintWordByUser = (newVocab, username) => `
CALL acquaint_word_record(get_vocab_id('${newVocab}'), get_user_id_by_name('${username}'));
`

module.exports.revokeWordByUser = (vocab, username) => `
CALL revoke_word_record(get_vocab_id('${vocab}'), get_user_id_by_name('${username}'));
`

module.exports.login = ({ username, password }) => `
select IDENTITY
from users
where username = '${username}'
  and password = '${password}'
`

module.exports.register = ({ username, password }) => `
SELECT user_register('${username}', '${password}') as result;
`
