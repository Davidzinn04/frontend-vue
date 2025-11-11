import api from './api'

const RESOURCE = '/subresources'

export default {
  list(params = {}) {
    return api.get(RESOURCE, { params })
  },
  get(id) {
    return api.get(`${RESOURCE}/${id}`)
  },
  create(payload) {
    return api.post(RESOURCE, payload)
  },
  update(id, payload) {
    return api.put(`${RESOURCE}/${id}`, payload)
  },
  remove(id) {
    return api.delete(`${RESOURCE}/${id}`)
  }
}
