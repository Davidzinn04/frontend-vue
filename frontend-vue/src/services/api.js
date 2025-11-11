import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 8000
})

// interceptors simples para erros globais (opcional)
api.interceptors.response.use(
  r => r,
  err => {
    // você pode logar ou transformar o erro aqui
    return Promise.reject(err)
  }
)

export default api
