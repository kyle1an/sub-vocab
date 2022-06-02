let url = 'https://subvocab.herokuapp.com';
// url = "https://sub-vocab-server.vercel.app";
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
  if (newWord.word.length > 32) return;
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
  if (vocab.word.length > 32) return;
  return await fetch(`${url}/api/revokeWord`, {
    body: JSON.stringify(vocab),
    method: 'post',
    headers,
  })
    .then(response => response.json())
    .then(data => data);
}
