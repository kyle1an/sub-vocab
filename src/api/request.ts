export function fetchPost(url: string, options: RequestInit = {}) {
  return fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options
  })
    .then(response => response.json())
    .then(data => data)
}
