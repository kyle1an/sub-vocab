const checkValidation = (word) => `
SELECT is_valid
FROM user_vocab
where word = '${word}';
`

module.exports.wordsQuery = `
SELECT c.id, c.word as w, c.is_valid, c.is_user
FROM common_vocab c
UNION
SELECT u.id, LOWER(u.word), u.is_valid, u.is_user
FROM user_vocab u;
`;

module.exports.acquaint = (newVocab) => `
SELECT Acquaint ('${newVocab}') as row_count;
${checkValidation(newVocab)}
`;

module.exports.revokeWord = (vocab) => `
UPDATE user_vocab SET is_valid = false WHERE word = '${vocab}';
${checkValidation(vocab)}
`;
