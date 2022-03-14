var mongoose = require('../../db').mongooseInstance
var schemas = require('./schema')
var models = {}
for(let schema in schemas) {
    models[schema] = mongoose.model(schema,schemas[schema])
}
module.exports = models