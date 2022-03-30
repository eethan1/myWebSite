const {JsonDB} = require('node-json-db')
const {Config} = require('node-json-db/dist/lib/JsonDBConfig')

const db = new JsonDB(new Config('db.json', true, true))

function findUser({username = ''}) {
  console.log(`Try find user ${username}`)
  try {
    return db.getData(`/users/${username}`) //path traversal?
  } catch (e) {
    console.log(e.toString())
    console.log(`user ${username} not found`)
    return null
  }
}

function registUser({username = '', password = '', avatar = ''}) {
  console.log(`Try regist with un ${username} & pw ${password} & av ${avatar.slice(0, 15)}`)
  try {
    if (!username || !password || !avatar) {
      throw Error('regist fail something is Empty')
    }
    return db.push(`/users/${username}`, {username, password, avatar}, true)
  } catch (e) {
    console.log(e.toString())
    return null
  }
}

module.exports = {findUser, registUser}
