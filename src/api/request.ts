import axios from 'axios'

export function postRequest(url: string, payload = {}, config = {}) {
  return axios.post(`${url}`, payload, { timeout: 4000, ...config }).then(response => response.data)
}
