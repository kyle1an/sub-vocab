import axios from 'axios'

export function postRequest(url: string, payload = {}) {
  return axios.post(`${url}`, payload).then(response => response.data)
}
