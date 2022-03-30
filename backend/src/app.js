const express = require('express')
const session = require('express-session')
const fs = require('fs')
const path = require('path')
const csurf = require('csurf')
const crypto = require('crypto')

fs.unlinkSync(path.join(__dirname, '../db.json'))

const db = require('./db')

const app = express()

const PORT = process.env.PORT || 8080
console.log(__dirname)
const publicDir = path.join(__dirname, '../../frontend/build')
const uploadDir = path.join(__dirname, '../public')

app.use(express.json({limit: '5mb'}))
app.use(
  session({
    cookie: {
      path: '/',
      httpOnly: true,
      secure: false,
      maxAge: null,
    },
    secret: crypto.randomBytes(16).toString('base64'),
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
  })
)

const API = express.Router()
API.post('/login', async (req, res) => {
  const {username, password, avatar} = req.body
  if (!username || !password) {
    return res.status(400).json({err: 'empty username/password'})
  }
  const user = await db.findUser({username})

  if (user) {
    // login & change Avatar
    if (user.password !== password) {
      return res.status(403).json({err: 'password errr'})
    }
    if (avatar !== '') {
      if (!/^data:\S+,\S+$/.test(avatar) || avatar.length > 1024 * 1024 * 5) {
        // stored xss?
        return res.status(403).json({err: `Invalid avatar with length ${avatar.length}`})
      }
      await db.registUser({username, password, avatar})
    }

    req.session.username = username

    return res.json({msg: 'login succeed'})
  } else {
    // regist with avatar & login
    if (!/^data:\S+,\S+$/.test(avatar) || avatar.length > 1024 * 1024 * 5) {
      // stored xss?
      return res.status(403).json({err: `Invalid avatar with length ${avatar.length}`})
    }

    await db.registUser({username, password, avatar})
    req.session.username = username
    return res.json({msg: 'regist succeed'})
  }
})

app.use('/api', API)

app.use(express.static(uploadDir))
app.use(express.static(publicDir))

app.get('*', (req, res) => {
  res.sendFile(publicDir + '/index.html')
})

app.listen(PORT, async () => {
  console.log(`Running on ${PORT}`)
  await db.registUser({
    username: 'admin',
    password: crypto.randomBytes(16).toString('base64'),
    avatar: 'Flag{i am admin:>}',
  })
})
