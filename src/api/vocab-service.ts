let url = 'https://subvocab-server.herokuapp.com';
// url = 'http://localhost:5001';
const headers = {
  'Content-Type': 'application/json',
};

export async function queryWords() {
  return await fetch(`${url}/api/queryWords`, { method: 'post', headers })
    .then(response => response.json())
    .then(data => data);
}

export async function acquainted(newWord: any) {
  console.log('newWord', newWord);
  return await fetch(`${url}/api/acquaint`, {
    body: JSON.stringify(newWord),
    method: 'post',
    headers
  })
    .then(response => response.json())
    .then(data => data);
}

export async function revokeWord(vocab: any) {
  return await fetch(`${url}/api/revokeWord`, {
    body: JSON.stringify(vocab),
    method: 'post',
    headers,
  })
    .then(response => response.json())
    .then(data => data);
}
