const {JsonDB} = require('node-json-db')
const {Config} = require('node-json-db/dist/lib/JsonDBConfig')
const db = new JsonDB(new Config('db.json', true, true))
const avatarMap = {}
var messageNum = 0
db.push('/messages', {})
async function findUser({username = ''}) {
  console.log(`Try find user ${username}`)
  try {
    return db.getData(`/users/${username}`) //path traversal?
  } catch (e) {
    console.log(e.toString())
    console.log(`user ${username} not found`)
    return null
  }
}

async function registUser({username = '', password = '', avatar = ''}) {
  console.log(`Try regist with un ${username} & pw ${password} & av ${avatar.slice(0, 15)}`)
  try {
    if (!username || !password || !avatar) {
      throw Error('regist fail something is Empty')
    }
    avatarMap[username] = avatar
    return db.push(`/users/${username}`, {username, password, avatar}, true)
  } catch (e) {
    console.log(e.toString())
    return null
  }
}

async function getMessages() {
  try {
    const msgs = await db.getData('/messages')
    for (const k in msgs) {
      msgs[k].avatar = avatarMap[msgs[k].username]
    }
    return msgs
  } catch (e) {
    console.log(e.toString())
    return {}
  }
}

async function createMessage({username, message}) {
  try {
    const ret = await db.push(`/messages/${messageNum}`, {username, message})
    messageNum += 1
    return {[messageNum - 1]: {username, message, avatar: avatarMap[username]}}
  } catch (e) {
    console.log(e.toString())
    return null
  }
}

async function deleteMessage({username, mid}) {
  try {
    const msg = await db.getData(`/messages/${mid}`)
    if (msg.username !== username) {
      throw `${username} try to delete ${mid} belong to ${msg.username}`
    }
    return db.delete(`/messages/${mid}`)
  } catch (e) {
    console.log(e.toString())
    return null
  }
}

async function getAvatar({username}) {
  try {
    const avatar = await db.getData(`/users/${username}/avatar`)
    return avatar
  } catch (e) {
    console.log(e.toString())
    return null
  }
}

module.exports = {
  findUser,
  registUser,
  getMessages,
  createMessage,
  deleteMessage,
  getAvatar,
  avatarMap,
}
