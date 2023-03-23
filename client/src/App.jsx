import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from 'react-router-dom'
import { Posts, Login } from './pages'
import { getUser } from './utils'

const ProtectedRoute = () => {
  const user = getUser()

  if (!user) {
    return <Navigate to={'/login'} replace />
  }

  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/posts" element={<Posts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
