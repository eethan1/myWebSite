var mongoose = require('../../db').mongooseInstance
var Schema = mongoose.Schema
var schemas = require('./schema.js')
var models = {}
for(let schema in schemas) {
    models[schema] = mongoose.model('msg',new Schema(schemas[schema]))
}
module.exports = models