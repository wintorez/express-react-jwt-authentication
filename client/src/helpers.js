import axios from 'axios'
import jwtDecode from 'jwt-decode'
import { StatusCodes } from 'http-status-codes'

export function getToken(key) {
  try {
    return JSON.parse(sessionStorage.getItem('tokens'))[key]
  } catch (error) {
    console.warn(error)
    return undefined
  }
}

export function logoutUser() {
  sessionStorage.clear()
  window.location.href = '/login'
}

export function getUser() {
  try {
    const accessToken = getToken('accessToken')

    return jwtDecode(accessToken)
  } catch (error) {
    return undefined
  }
}

async function refreshToken() {
  try {
    const refreshToken = getToken('refreshToken')

    const tokens = await authClient
      .post('/refresh-token', { refreshToken })
      .then((r) => r.data)

    // NOTE: We have to be careful to check what is the actual response of refresh token
    sessionStorage.setItem('tokens', JSON.stringify(tokens))

    return tokens
  } catch (error) {
    // NOTE: If refresh token fails for any reason, we have to logout
    logoutUser()
  }
}

// NOTE: A client without any interceptors for auth calls
export const authClient = axios.create({
  baseURL: 'http://localhost:3000',
})

// NOTE: A client with interceptors for the api calls
export const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
})

apiClient.interceptors.request.use(
  function (config) {
    const accessToken = getToken('accessToken')

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }

    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  function (response) {
    return response
  },
  async function (error) {
    const originalRequest = error.config

    // NOTE: accessToken is missing or invalid. No point in refreshing the token.
    if (error.response?.status === StatusCodes.UNAUTHORIZED) {
      console.log('accessToken is missing!')
      logoutUser()
    }

    // NOTE: accessToken is expired. We need to refresh the token.
    if (
      error.response?.status === StatusCodes.FORBIDDEN &&
      !originalRequest._retry
    ) {
      console.log('accessToken is expired. Refreshing...')
      originalRequest._retry = true
      const { accessToken } = await refreshToken()
      originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
      console.log('accessToken is refreshed. Retrying the last request.')
      return apiClient(originalRequest)
    }

    return Promise.reject(error)
  }
)
