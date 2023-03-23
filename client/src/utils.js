import axios from 'axios'
import jwtDecode from 'jwt-decode'
import { StatusCodes } from 'http-status-codes'

export function logoutUser() {
  sessionStorage.clear()
  window.location.href = '/login'
}

export function getUser() {
  try {
    const { accessToken } = JSON.parse(sessionStorage.getItem('tokens'))

    return jwtDecode(accessToken)
  } catch (error) {
    return undefined
  }
}

async function refreshToken() {
  try {
    const baseURL = 'http://localhost:3000'
    const { refreshToken } = JSON.parse(sessionStorage.getItem('tokens'))

    const tokens = await axios
      .post(`${baseURL}/refresh-token`, { refreshToken })
      .then((r) => r.data)

    sessionStorage.setItem('tokens', JSON.stringify(tokens))

    return tokens
  } catch (error) {
    logoutUser()
  }
}

export const httpClient = axios.create({
  baseURL: 'http://localhost:3000',
})

httpClient.interceptors.request.use(
  function (config) {
    const tokens = sessionStorage.getItem('tokens')

    if (tokens) {
      const { accessToken } = JSON.parse(tokens)
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }

    return config
  },
  function (error) {
    throw error
  }
)

httpClient.interceptors.response.use(
  function (response) {
    return response
  },
  async function (error) {
    if (window.location.pathname === '/login') throw error

    if (error.response?.status === StatusCodes.UNAUTHORIZED) {
      logoutUser()
    }

    const originalRequest = error.config

    if (
      error.response?.status === StatusCodes.FORBIDDEN &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true
      const { accessToken } = await refreshToken()
      originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
      return httpClient(originalRequest)
    }

    throw error
  }
)
