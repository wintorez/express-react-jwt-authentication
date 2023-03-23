require('dotenv').config()

const isNil = require('lodash/isNil')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

console.assert(
  process.env.ACCESS_TOKEN_SECRET,
  'Missing environment variable: ACCESS_TOKEN_SECRET'
)

console.assert(
  process.env.REFRESH_TOKEN_SECRET,
  'Missing environment variable: REFRESH_TOKEN_SECRET'
)

const posts = [
  { id: 1, title: 'Post 1', username: 'wintorez@gmail.com' },
  { id: 2, title: 'Post 2', username: 'wintorez@gmail.com' },
  { id: 3, title: 'Post 3', username: 'john@gmail.com' },
  { id: 4, title: 'Post 4', username: 'john@gmail.com' },
]

const users = [
  {
    username: 'wintorez@gmail.com',
    password: 'password',
    fullName: 'Reza Sadr',
  },
  {
    username: 'john@gmail.com',
    password: 'password',
    fullName: 'John Smith',
  },
]

let refreshTokens = []

app.get('/posts', authenticateToken, (req, res) => {
  res.json({
    items: posts.filter((each) => each.username === req.user.username),
    lastUpdate: new Date(),
  })
})

app.post('/login', (req, res) => {
  const user = users.find(
    (one) =>
      one.username === req.body.username && one.password === req.body.password
  )

  if (user) {
    const { username, fullName } = user

    const accessToken = generateAccessToken({ username, fullName })
    const refreshToken = generateRefreshToken({ username, fullName })

    refreshTokens.push(refreshToken)

    res.json({ accessToken, refreshToken })
  } else {
    res.sendStatus(StatusCodes.UNAUTHORIZED)
  }
})

app.post('/logout', (req, res) => {
  const { refreshToken } = req.body

  if (refreshTokens.includes(refreshToken)) {
    refreshTokens = refreshTokens.filter((each) => each !== refreshToken)

    res.sendStatus(StatusCodes.OK)
  } else {
    res.sendStatus(StatusCodes.NOT_FOUND)
  }
})

app.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body

  if (isNil(refreshToken)) return res.sendStatus(StatusCodes.UNAUTHORIZED)

  if (!refreshTokens.includes(refreshToken))
    return res.sendStatus(StatusCodes.FORBIDDEN)

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(StatusCodes.FORBIDDEN)
    const { username, fullName } = user
    const accessToken = generateAccessToken({ username, fullName })
    res.json({ accessToken, refreshToken })
  })
})

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '10s',
  })
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (isNil(token)) return res.sendStatus(StatusCodes.UNAUTHORIZED)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(StatusCodes.FORBIDDEN)
    req.user = user
    next()
  })
}

app.listen(3000)
