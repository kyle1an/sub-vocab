module.exports.login = ({ username, password, token }) => `
CALL login('${username}', '${password}', '${token}');
`
