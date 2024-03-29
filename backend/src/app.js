const express = require('express')
const session = require('express-session')
const fs = require('fs')
const path = require('path')
const csurf = require('csurf')
const crypto = require('crypto')

fs.rmSync(path.join(__dirname, '../db.json'), {force: true})

const db = require('./db')

const app = express()

const PORT = process.env.PORT || 8080
console.log(__dirname)
const publicDir = path.join(__dirname, '../../frontend/dist')
const messageAPI = require('./message')

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
app.use((req, res, next) => {
  if (req.method === 'POST') {
    if (
      !/^https:\/\/r10921a14-padns-midterm\.herokuapp\.com\//.test(req.headers.referer) &&
      !/^http:\/\/localhost:8080/.test(req.headers.referer) &&
      !/^http:\/\/localhost:3000/.test(req.headers.referer)
    ) {
      console.log(`evil referer: ${req.headers.referer}`)
      return res.status(403).send({err: 'csrf attack?'})
    }
  }
  next()
})

app.get('/source', (req, res) => {
  const f = req.query.file
  console.log(req.query)
  if (['app', 'db', 'message'].indexOf(f) !== -1) return res.sendFile(`${__dirname}/${f}.js`)
  return res.status(404)
})
const userAPI = express.Router()
userAPI.post('/login', async (req, res) => {
  const {username, password, avatar} = req.body
  if (!username || !password) {
    return res.status(400).json({err: 'empty username/password'})
  }
  const user = await db.findUser({username})

  if (user?.username) {
    // login & change Avatar
    if (user.password != password) {
      return res.status(403).json({err: 'password errr'})
    }
    if (avatar && typeof avatar === 'string') {
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
    if (!avatar || !/^data:\S+,\S+$/.test(avatar)) {
      // stored xss?
      return res.status(403).json({err: `Invalid avatar  ${avatar}`})
    }

    if (avatar.length > 1024 * 1024 * 5) {
      return res.status(403).json({err: `avatar.length  ${avatar.length} > 1024 * 1024 * 5`})
    }

    await db.registUser({username, password, avatar})
    req.session.username = username
    return res.json({msg: 'regist succeed'})
  }
})

app.use('/api', userAPI)

app.use('/api', messageAPI)

app.use(express.static(publicDir))

app.get('*', (req, res) => {
  res.sendFile(publicDir + '/index.html')
})

app.listen(PORT, async () => {
  console.log(`Running on ${PORT}`)
  await db.registUser({
    username: 'admin',
    password: crypto.randomBytes(16).toString('base64'),
    avatar: 'https://i.imgur.com/UA2qy0H.gif',
  })
  await db.createMessage({username: 'admin', message: 'try hack me'})
})
