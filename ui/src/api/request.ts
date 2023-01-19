import axios from 'axios'

export function postRequest<TData>(url: string, payload = {}, config = {}) {
  return axios.post<TData>(`${url}`, payload, { ...config }).then(response => response.data)
}
