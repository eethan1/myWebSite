const express = require('express')
const route = express.Router()
const db = require('./db')
route.get('/messages', async (req, res) => {
  const msgs = await db.getMessages()
  res.json(msgs)
})

route.use((req, res, next) => {
  if (!req.session.username) {
    return res.status(403).json({err: 'not login'})
  }
  next()
})
route.post('/messages', async (req, res) => {
  const {message} = req.body

  if (typeof message !== 'string') {
    return res.status(400).json({err: 'not a string'})
  }
  const ret = await db.createMessage({username: req.session.username, message})
  if (ret === null) {
    return res.status(500).json({err: 'create message fail'})
  }
  return res.json({msg: 'create message succeed', message: ret})
})

route.delete('/messages/:mid', async (req, res) => {
  const mid = req.params.mid
  const ret = await db.deleteMessage({username: req.session.username, mid})
  if (ret === null) {
    return res.status(500).json({err: `delete ${mid} failed`})
  }
  console.log(`delete msg ${mid}`)
  return res.json({msg: `delete message ${mid} succeed`})
})

module.exports = route
