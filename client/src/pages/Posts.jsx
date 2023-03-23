import useSWR from 'swr'
import { httpClient, getUser, logoutUser } from '../utils'

const fetcher = () => httpClient.get('/posts').then((r) => r.data)

export function Posts() {
  const user = getUser() ?? {}
  const { data, error, isLoading } = useSWR('/posts', fetcher, {
    refreshInterval: 1000,
  })

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

              const { refreshToken } = JSON.parse(
                sessionStorage.getItem('tokens')
              )

              await httpClient.post('/logout', {
                refreshToken,
              })
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
          <p>
            <strong>List of post by {user.fullName}:</strong>
          </p>
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
