import { useEffect } from 'react'
import useSWR from 'swr'
import {
  apiClient,
  getUser,
  logoutUser,
  getToken,
  authClient,
} from '../helpers'

const fetcher = () => apiClient.get('/posts').then((r) => r.data)

export function Posts() {
  const user = getUser() ?? {}
  const { data, error, isLoading } = useSWR('/posts', fetcher, {
    refreshInterval: 1000,
  })

  useEffect(() => {
    console.log('Sending a request the server every 1000 ms')
    console.log('accessToken expires every 10 seconds')
  }, [])

  useEffect(() => {
    if (data?.lastUpdate) {
      console.log(
        `Last update:`,
        new Date(data.lastUpdate).toLocaleTimeString()
      )
    }
  }, [data?.lastUpdate])

  return (
    <div>
      <aside>
        Hello, {user.fullName}
        <br />
        <a
          href="#"
          onClick={async (e) => {
            try {
              e.preventDefault()

              const refreshToken = getToken('refreshToken')

              await authClient.post('/logout', { refreshToken })
            } catch (error) {
              console.error(error)
            } finally {
              logoutUser()
            }
          }}
        >
          Logout
        </a>
      </aside>
      <h1>Posts</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="notice">{error.message}</p>
      ) : data?.items?.length ? (
        <>
          <h4>List of post by {user.fullName}</h4>
          <ul>
            {data.items.map((each) => (
              <li key={each.id}>{each.title}</li>
            ))}
          </ul>
          <p>
            Last update:{' '}
            <mark>{new Date(data.lastUpdate).toLocaleTimeString()}</mark>
          </p>
        </>
      ) : (
        <p className="notice">No Data</p>
      )}
    </div>
  )
}
