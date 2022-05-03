const url = 'https://subvocab-server.herokuapp.com';
// const url = 'http://localhost:5001';
const headers = {
  'Content-Type': 'application/json',
};

export const queryWords = async () => {
  return await fetch(`${url}/api/queryWords`, { method: 'post', headers })
    .then(response => response.json())
    .then(data => data);
}

export const acquainted = async (newWord) => {
  console.log('newWord', newWord);
  return await fetch(`${url}/api/acquaint`, {
    body: JSON.stringify(newWord),
    method: 'post',
    headers
  })
    .then(response => response.json())
    .then(data => data);
}

export const revokeWord = async (vocab) => {
  return await fetch(`${url}/api/revokeWord`, {
    body: JSON.stringify(vocab),
    method: 'post',
    headers,
  })
    .then(response => response.json())
    .then(data => data);
}


