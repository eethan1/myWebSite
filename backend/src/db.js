var config = global.config || require('./config')
global.mongoose = require('mongoose')
mongoose.connect(`mongodb://${config.dbIP}:27017/yggd2mir`, {useNewUrlParser: true}).catch((err) => {
  console.log('main db connect error')
  console.error(err)
  process.exit()
})
mongoose.connection.on('error', (err) => {
  console.log('main db connect error')
  console.error(err)
})

module.exports = {
  mongooseInstance: mongoose,
}
