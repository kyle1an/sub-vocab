import axios from 'axios'

export function postRequest(url: string, payload = {}, config = {}) {
  return axios.post(`${url}`, payload, { ...config }).then(response => response.data)
}
