const checkValidityByUser = (word, username) => `
select check_word_validity_for_user(get_vocab_id('${word}'), get_user_id_by_name('${username}')) as acquainted;
`

module.exports.userWordsQuery = (username) => `
SELECT c.word as w, c.is_valid as acquainted, c.is_user
FROM common_vocab c
UNION
select ls.word, r.acquainted, ls.is_user
from vocabulary_list ls
         LEFT JOIN user_vocab_record r ON r.vocab_id = ls.id and user_id = get_user_id_by_name('${username}')
where ls.is_valid = true
`

module.exports.acquaintWordByUser = (newVocab, username) => `
call acquaint_word_record(get_vocab_id('${newVocab}'), get_user_id_by_name('${username}'));
${checkValidityByUser(newVocab, username)}
`

module.exports.revokeWordByUser = (vocab, username) => `
call revoke_word_record(get_vocab_id('${vocab}'), get_user_id_by_name('${username}'));
${checkValidityByUser(vocab, username)}
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
